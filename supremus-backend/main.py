from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
<<<<<<< HEAD
        "https://supremus-system.vercel.app/" 
=======
        "https://supremus-system.vercel.app" 
>>>>>>> cb59c3d6c9422770594c07e6f66336bad623a223
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialização do Firebase
cred = credentials.Certificate("firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Inicialização Google Sheets
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds_gs = ServiceAccountCredentials.from_json_keyfile_name("credenciais.json", scope)
client_gs = gspread.authorize(creds_gs)
sheet = client_gs.open("Supremus_service_flow").sheet1

# Modelo atualizado com numeroSerie
class OrdemServico(BaseModel):
    nome: str
    sobrenome: str
    whatsapp: str
    marca: str
    modelo: str
    numeroSerie: str  
    acessorios: str
    relato: str
    prioridade: str

@app.post("/registrar-os")
async def registrar_os(item: OrdemServico):
    try:
        # 1. Identificação e OS
        os_base = "".join(filter(str.isdigit, item.whatsapp))[-4:]
        docs = db.collection("ordens_servico").where(filter=firestore.FieldFilter("id_os", "==", os_base)).stream()
        proximo_sufixo = len(list(docs)) + 1
        os_completa = f"{os_base}-{proximo_sufixo}"
        
        # 2. Lógica de Prazos e Cores (Mapeamento)
        # O React envia: "Muito urgente - 1 dia", "Urgente - 3 dias", etc.
        prazos_map = {
            "Não urgente - 7 dias": {"dias": 7, "cor": "Verde"},
            "Pouco urgente - 5 dias": {"dias": 5, "cor": "Azul"},
            "Urgente - 3 dias": {"dias": 3, "cor": "Laranja"},
            "Muito urgente - 1 dia": {"dias": 1, "cor": "Vermelho"}
        }
        
        # Busca a configuração baseada na escolha do técnico (padrão 7 dias se falhar)
        config_prioridade = prazos_map.get(item.prioridade, {"dias": 7, "cor": "Verde"})
        
        data_hora_entrada = datetime.now()
        data_limite = (data_hora_entrada + timedelta(days=config_prioridade["dias"])).strftime("%d/%m/%Y")
        entrada_str = data_hora_entrada.strftime("%d/%m/%Y %H:%M")

        # 3. Salvar no Firebase
        dados_fb = item.dict()
        dados_fb.update({
            "os_completa": os_completa,
            "id_os": os_base,
            "sufixo": proximo_sufixo,
            "data_entrada": entrada_str,
            "data_limite_triagem": data_limite,
            "cor_prioridade": config_prioridade["cor"],
            "status": "Triagem"
        })
        db.collection("ordens_servico").document(os_completa).set(dados_fb)

        # 4. Salvar na Planilha (Respeitando as colunas de Identificação e Fluxo)
        linha_planilha = [
            os_base,                # ID_OS
            proximo_sufixo,         # Sufixo
            f"{item.nome} {item.sobrenome}", 
            item.whatsapp, 
            item.marca, 
            item.modelo, 
            item.numeroSerie,       # NS Real
            item.acessorios, 
            item.relato, 
            config_prioridade["cor"], # COR DINÂMICA (Verde, Azul, Laranja ou Vermelho)
            entrada_str,            # Entrada
            "A definir",            # Técnico
            data_limite,            # Prazo Calculado
            "Triagem"               # Status
        ]
        
        sheet.append_row(linha_planilha)

        return {"status": "sucesso", "os": os_completa}
    
    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    








@app.get("/listar-os")
async def listar_os():
    try:
        docs = db.collection("ordens_servico").stream()
        lista_completa = []

        for doc in docs:
            dados = doc.to_dict()
            lista_completa.append({
                "os": dados.get("os_completa"),
                "equipamento": f"{dados.get('marca')} {dados.get('modelo')}",
                "cliente": dados.get("nome"),
                "entrada": dados.get("data_entrada").split(" ")[0], # Apenas a data
                "prazo": dados.get("data_limite_triagem"),
                "status": dados.get("status"),
                "cor": dados.get("cor_prioridade", "Verde") # Cor definida no cadastro
            })

        em_andamento = [os for os in lista_completa if os["status"] != "Pronto"]
        finalizados = [os for os in lista_completa if os["status"] == "Pronto"]


        em_andamento.sort(key=lambda x: datetime.strptime(x["prazo"], "%d/%m/%Y"))

        return em_andamento + finalizados

    except Exception as e:
        print(f"Erro ao listar: {e}")
        raise HTTPException(status_code=500, detail=str(e))






import os
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)



