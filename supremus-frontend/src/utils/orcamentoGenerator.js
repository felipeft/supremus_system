import { PDFDocument, rgb } from 'pdf-lib';

export const gerarOrcamentoPDF = async (os, form, tecnicoNome) => {
  try {
    const existingPdfBytes = await fetch('/ORÇAMENTO.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
// Define o título interno (sugerido pelo navegador ao salvar manualmente)
    pdfDoc.setTitle(`ORCAMENTO-${os.os}`);
    
// Fontes e assinatura
    const fontBold = await pdfDoc.embedFont('Helvetica-Bold');
    const fontRegular = await pdfDoc.embedFont('Helvetica');
    const fontSignature = await pdfDoc.embedFont('Times-Italic');
    
    const [firstPage] = pdfDoc.getPages();
    const { height } = firstPage.getSize();

    const draw = (text, x, y, size = 11, font = fontBold) => {
      if (!text) return;
      firstPage.drawText(String(text), { x, y: height - y, size, font, color: rgb(0, 0, 0) });
    };

// Formatação PT-BR
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const valorFinanceiro = Number(form.valor_reparo).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

// Mensagem obrigatória de aprovação [cite: 37]
    const diagnosticoCompleto = `${form.diagnostico_tecnico}\n\nVocê aprova este orçamento para darmos continuidade a manutenção?`;

// Title Case para assinatura
    const tecnicoFormatado = tecnicoNome
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');

// Cabeçalho
    draw(dataAtual, 110, 186, 14);                
    draw(os.cliente.toUpperCase(), 60, 230, 14);  
    draw(os.whatsapp, 60, 245, 14, fontRegular);  
    draw(String(os.os), 335, 220, 26); 

// Equipamento
    draw(os.equipamento.toUpperCase(), 70, 370, 12); 
    draw(os.relato, 350, 370, 10, fontRegular);      

// Diagnóstico
    firstPage.drawText(diagnosticoCompleto, {
      x: 70,
      y: height - 480,
      size: 11,
      font: fontRegular,
      maxWidth: 450,
      lineHeight: 14
    });

// Fechamento
    draw(valorFinanceiro, 440, 620, 18); 
    draw(`Téc. ${tecnicoFormatado}`, 250, 750, 13, fontSignature);

// Geração de saída
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    window.open(url, '_blank');

  } catch (error) {
    console.error("Erro na geração do PDF:", error);
    alert("Falha técnica ao gerar documento.");
  }
};