import { PDFDocument, rgb } from 'pdf-lib';

export const gerarOrcamentoPDF = async (os, form, tecnicoNome) => {
  try {
    // 1. Carrega o template de orçamento [cite: 68]
    const existingPdfBytes = await fetch('/ORÇAMENTO.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Fontes padrão do PDF
    const fontBold = await pdfDoc.embedFont('Helvetica-Bold');
    const fontRegular = await pdfDoc.embedFont('Helvetica');
    const fontSignature = await pdfDoc.embedFont('Times-Italic'); // Fonte que se assemelha a assinatura
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    const draw = (text, x, y, size = 11, font = fontBold) => {
      if (!text) return;
      firstPage.drawText(String(text), { x, y: height - y, size, font, color: rgb(0, 0, 0) });
    };

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    // Formatação do valor para padrão brasileiro (ex: 920,00) [cite: 106, 106]
    const valorFinanceiro = Number(form.valor_reparo).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Texto do diagnóstico com a mensagem obrigatória [cite: 104]
    const diagnosticoCompleto = `${form.diagnostico_tecnico}\n\nVocê aprova este orçamento para darmos continuidade a manutenção?`;

    // --- LÓGICA DE FORMATAÇÃO DO NOME DO TÉCNICO ---
    // Transforma "felipe feitosa" ou "FELIPE FEITOSA" em "Felipe Feitosa"
    const tecnicoFormatado = tecnicoNome
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');

    // --- MAPEAMENTO DE COORDENADAS (VALORES ALINHADOS) ---
    // Topo [cite: 70, 71, 72]
    draw(dataAtual, 110, 186, 14);                
    draw(os.cliente.toUpperCase(), 60, 230, 14);  
    draw(os.whatsapp, 60, 245, 14, fontRegular);  
    draw(String(os.os), 335, 220, 26); 

    // Meio [cite: 73, 74]
    draw(os.equipamento.toUpperCase(), 70, 370, 12); 
    draw(os.relato, 350, 370, 10, fontRegular);      

    // Diagnóstico e Valor [cite: 75, 76, 77]
    firstPage.drawText(diagnosticoCompleto, {
      x: 70,
      y: height - 480,
      size: 11,
      font: fontRegular,
      maxWidth: 450,
      lineHeight: 14
    });

    draw(valorFinanceiro, 440, 620, 18); // Valor formatado com ,00 [cite: 106]

    // Assinatura do Técnico com fonte Itálica e iniciais tratadas
    draw(`Téc. ${tecnicoFormatado}`, 250, 750, 13, fontSignature);

    // Finalização e Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error("Erro ao gerar Orçamento:", error);
    alert("Erro ao processar o PDF de Orçamento. Verifique se 'ORÇAMENTO.pdf' está na pasta public.");
  }
};