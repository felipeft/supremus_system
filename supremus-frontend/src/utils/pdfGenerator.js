import { PDFDocument, rgb } from 'pdf-lib';

export const gerarReciboPDF = async (formData, selectedCountry, acessorios, osGerada, obterOSBase) => {
  try {
    const existingPdfBytes = await fetch('/OS_FINAL_2.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const fontBold = await pdfDoc.embedFont('Helvetica-Bold');
    const fontRegular = await pdfDoc.embedFont('Helvetica');
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    const draw = (text, x, y, size = 11, font = fontBold) => {
      if (!text) return;
      firstPage.drawText(String(text), { x, y: height - y, size, font, color: rgb(0, 0, 0) });
    };

    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const ano = now.getFullYear();
    const dataEspacada = `${dia}        ${mes}        ${ano}`;

    const nomeCompleto = `${formData.nome} ${formData.sobrenome}`.toUpperCase();
    const nrOS = osGerada || obterOSBase();


    draw(nrOS, 433, 93, 20); 
    draw(nomeCompleto, 143, 134, 12); 
    draw(dataEspacada, 420, 160, 12); 
    draw(`${selectedCountry.code} ${formData.whatsapp}`, 130, 163, 11); 
    draw(`${formData.marca} ${formData.modelo}`.toUpperCase(), 70, 240, 12); 
    draw(formData.numeroSerie.toUpperCase(), 400, 240, 12);
    draw(formData.relato, 75, 365, 12, fontRegular);

    if (acessorios.base)        draw('X', 80, 293, 14);
    if (acessorios.kit_escovas) draw('X', 148, 293, 14);
    if (acessorios.caixa_sac)   draw('X', 276, 293, 14);
    if (acessorios.acess_comp)  draw('X', 393, 293, 14);

    draw(nrOS, 433, 613, 20); 
    draw(`${formData.marca} ${formData.modelo}`.toUpperCase(), 100, 680, 13);

    if (acessorios.base)        draw('X', 80, 719, 14);
    if (acessorios.kit_escovas) draw('X', 148, 719, 14);
    if (acessorios.caixa_sac)   draw('X', 276, 719, 14);
    if (acessorios.acess_comp)  draw('X', 393, 719, 14);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
};