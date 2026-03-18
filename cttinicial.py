import gspread
from oauth2client.service_account import ServiceAccountCredentials
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

# Firebase
if not firebase_admin._apps:
    cred_fb = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred_fb)
db = firestore.client()

# Google Sheets
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds_gs = ServiceAccountCredentials.from_json_keyfile_name("credenciais.json", scope)
client_gs = gspread.authorize(creds_gs)
sheet = client_gs.open("Supremus_service_flow").sheet1

# Limpa o firebase
def limpar_banco_firebase():
    print("Limpando dados antigos do Firebase...")
    docs = db.collection("ordens_servico").stream()
    for doc in docs:
        doc.reference.delete()
    print("Firebase limpo com sucesso!")

# Registrar nova entrada de teste
def registrar_entrada(os_base, cliente, whatsapp, aparelhos):
    """
    aparelhos: lista de dicionários com {marca, modelo, acessorios, relato}
    """
    data_entrada = datetime.now()
    data_entrada_str = data_entrada.strftime("%d/%m/%Y %H:%M")
    
    # Prazo de Triagem (7 dias)
    prazo_triagem = data_entrada + timedelta(days=7)
    
    for i, item in enumerate(aparelhos, start=1):
        os_completa = f"{os_base}-{i}"
        sn = f"SN-{whatsapp[-4:]}" # Logica dos 4 digitos finais
        
        # Estrutura de Dados
        dados_os = {
            # Bloco A: Identificação
            "id_os": os_base,
            "sufixo": i,
            "os_completa": os_completa,
            "cliente": cliente,
            "whatsapp": whatsapp,
            "marca": item['marca'],
            "modelo": item['modelo'],
            "serie_sn": sn,
            "acessorios": item['acessorios'],
            "relato_cliente": item['relato'],
            
            # Bloco B: Fluxo de Trabalho
            "data_entrada": data_entrada_str,
            "status": "Triagem", # Status inicial
            "sub_status": "Tempo sobrando", # Lógica de cor verde inicial
            "tecnico_responsavel": "A definir",
            "diagnostico_tecnico": "",
            "limite_triagem": prazo_triagem.strftime("%d/%m/%Y"),
            
            # Bloco C: Financeiro
            "valor_reparo": 0.0,
            "data_aprovacao": "",
            "entrega_status": "Ainda não pegou",
            "prazo_entrega": "",
            "garantia_ate": ""
        }

        # Salva dados no firebase
        db.collection("ordens_servico").document(os_completa).set(dados_os)
        print(f"Firebase: Item {os_completa} registrado.")

        # Salva na planilha
        linha_planilha = [
            os_base, i, cliente, whatsapp, item['marca'], item['modelo'], 
            sn, item['acessorios'], item['relato'], "Verde", data_entrada_str,
            "A definir", "", "Triagem", 0, "", "", "", ""
        ]
        sheet.append_row(linha_planilha)
        print(f"📊 Planilha: Linha para {os_completa} adicionada.")

# teste
if __name__ == "__main__":
    limpar_banco_firebase()

    # Simulação: Cliente Camila traz 2 aparelhos
    meus_aparelhos = [
        {
            "marca": "Xiaomi", 
            "modelo": "Mi Robot Vacuum Mop 2 Lite", 
            "acessorios": "+ cxa + base", 
            "relato": "Inoperante"
        },
        {
            "marca": "Xiaomi", 
            "modelo": "Mi Robot Vacuum Mop 2 Pro", 
            "acessorios": "Apenas o robô", 
            "relato": "Escova não gira"
        }
    ]
    
    registrar_entrada("2981", "Camila", "8585282981", meus_aparelhos)
    
    print("\nTeste concluído! Verifique o Firebase e a Planilha.")