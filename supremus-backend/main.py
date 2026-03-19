from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime, timedelta
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialização Firebase
cred = credentials.Certificate("firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Modelos de Dados
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

class EdicaoOS(BaseModel):
    status: str
    diagnostico_tecnico: str = ""
    valor_aparelho: float = 0.0
    valor_reparo: float = 0.0
    prazo_custom: str = ""
    substatus_pronto: str = "Cliente não buscou"

@app.post("/registrar-os")
async def registrar_os(item: OrdemServico):
    try:
        os_base = "".join(filter(str.isdigit, item.whatsapp))[-4:]
        docs = db.collection("ordens_servico").where(filter=firestore.FieldFilter("id_os", "==", os_base)).stream()
        proximo_sufixo = len(list(docs)) + 1
        os_completa = f"{os_base}-{proximo_sufixo}"
        
        prazos_map = {
            "Não urgente - 7 dias": {"dias": 7, "cor": "Verde"},
            "Pouco urgente - 5 dias": {"dias": 5, "cor": "Azul"},
            "Urgente - 3 dias": {"dias": 3, "cor": "Laranja"},
            "Muito urgente - 1 dia": {"dias": 1, "cor": "Vermelho"}
        }
        
        config = prazos_map.get(item.prioridade, {"dias": 7, "cor": "Verde"})
        hoje = datetime.now()
        data_limite = (hoje + timedelta(days=config["dias"])).strftime("%d/%m/%Y")
        
        dados_fb = item.dict()
        dados_fb.update({
            "os_completa": os_completa, "id_os": os_base, "sufixo": proximo_sufixo,
            "data_entrada": hoje.strftime("%d/%m/%Y %H:%M"),
            "data_limite_triagem": data_limite, "cor_prioridade": config["cor"],
            "status": "Triagem", "diagnostico_tecnico": "", "valor_aparelho": 0.0,
            "valor_reparo": 0.0, "substatus_pronto": ""
        })
        db.collection("ordens_servico").document(os_completa).set(dados_fb)
        return {"status": "sucesso", "os": os_completa}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/listar-os")
async def listar_os():
    try:
        docs = db.collection("ordens_servico").stream()
        lista = []
        for doc in docs:
            d = doc.to_dict()
            lista.append({
                "os": d.get("os_completa"),
                "equipamento": f"{d.get('marca', '')} {d.get('modelo', '')}".strip(),
                "cliente": f"{d.get('nome', '')} {d.get('sobrenome', '')}".strip(),
                "whatsapp": d.get("whatsapp"), "numeroSerie": d.get("numeroSerie"),
                "acessorios": d.get("acessorios"), "relato": d.get("relato"),
                "entrada": d.get("data_entrada", "").split(" ")[0],
                "prazo": d.get("data_limite_triagem"), "status": d.get("status"),
                "cor": d.get("cor_prioridade"), "diagnostico_tecnico": d.get("diagnostico_tecnico", ""),
                "valor_aparelho": d.get("valor_aparelho", 0.0), "valor_reparo": d.get("valor_reparo", 0.0),
                "substatus_pronto": d.get("substatus_pronto", "")
            })
        return lista
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/atualizar-os/{os_id}")
async def atualizar_os(os_id: str, item: EdicaoOS):
    try:
        doc_ref = db.collection("ordens_servico").document(os_id)
        hoje = datetime.now()
        
        # Filtro numérico para tratar "1 dia" ou "30 dias"
        nums = "".join(filter(str.isdigit, item.prazo_custom))
        dias_num = int(nums) if nums else 7

        nova_cor = "Verde"
        # ESCALA SUPREMUS DE REPARO
        if item.status == "Em Reparo":
            if dias_num <= 2: nova_cor = "Roxo"
            elif dias_num <= 5: nova_cor = "Vermelho"
            elif dias_num <= 7: nova_cor = "Laranja"
            elif dias_num <= 10: nova_cor = "Amarelo"
            elif dias_num <= 20: nova_cor = "Verde"
            else: nova_cor = "Azul"
        
        # LÓGICA DE TRIAGEM (COM SUBSTATUS CINZA)
        elif item.status == "Triagem":
            if item.diagnostico_tecnico.strip() and item.valor_reparo > 0:
                nova_cor = "Cinza"
            else:
                if dias_num <= 1: nova_cor = "Vermelho"
                elif dias_num <= 3: nova_cor = "Laranja"
                elif dias_num <= 5: nova_cor = "Azul"
                else: nova_cor = "Verde"
        
        elif item.status == "Pronto":
            nova_cor = "Verde" if item.substatus_pronto == "Cliente buscou" else "Preto"

        # Cálculo da Data Limite
        nova_data = (hoje + timedelta(days=dias_num)).strftime("%d/%m/%Y")
        if item.status == "Pronto": nova_data = hoje.strftime("%d/%m/%Y")

        dados = {
            "status": item.status, "diagnostico_tecnico": item.diagnostico_tecnico,
            "valor_aparelho": item.valor_aparelho, "valor_reparo": item.valor_reparo,
            "cor_prioridade": nova_cor, "substatus_pronto": item.substatus_pronto,
            "data_limite_triagem": nova_data
        }
        doc_ref.update(dados)
        return {"status": "sucesso"}
    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))