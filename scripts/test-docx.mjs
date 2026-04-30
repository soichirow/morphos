import { Document, Packer, Paragraph, TextRun } from "docx"
import JSZip from "jszip"
import { writeFileSync } from "node:fs"

const doc = new Document({
  sections: [{ children: [new Paragraph({ children: [new TextRun("hello")] })] }],
})
const buf = await Packer.toBuffer(doc)

const zip = await JSZip.loadAsync(buf)
const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Test">
<a:themeElements>
<a:clrScheme name="Test">
<a:dk1><a:srgbClr val="111111"/></a:dk1><a:lt1><a:srgbClr val="EEEEEE"/></a:lt1>
<a:dk2><a:srgbClr val="222222"/></a:dk2><a:lt2><a:srgbClr val="DDDDDD"/></a:lt2>
<a:accent1><a:srgbClr val="FF0000"/></a:accent1><a:accent2><a:srgbClr val="00FF00"/></a:accent2>
<a:accent3><a:srgbClr val="0000FF"/></a:accent3><a:accent4><a:srgbClr val="FFFF00"/></a:accent4>
<a:accent5><a:srgbClr val="FF00FF"/></a:accent5><a:accent6><a:srgbClr val="00FFFF"/></a:accent6>
<a:hlink><a:srgbClr val="0000EE"/></a:hlink><a:folHlink><a:srgbClr val="551A8B"/></a:folHlink>
</a:clrScheme>
<a:fontScheme name="Test">
<a:majorFont><a:latin typeface="Geist"/><a:ea typeface="Meiryo"/><a:cs typeface=""/><a:font script="Jpan" typeface="Meiryo"/></a:majorFont>
<a:minorFont><a:latin typeface="Geist"/><a:ea typeface="Meiryo"/><a:cs typeface=""/><a:font script="Jpan" typeface="Meiryo"/></a:minorFont>
</a:fontScheme>
<a:fmtScheme name="Test"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
</a:themeElements></a:theme>`

zip.file("word/theme/theme1.xml", themeXml)
let ct = await zip.file("[Content_Types].xml").async("string")
if (!ct.includes("/word/theme/theme1.xml")) {
  ct = ct.replace("</Types>", '<Override ContentType="application/vnd.openxmlformats-officedocument.theme+xml" PartName="/word/theme/theme1.xml"/></Types>')
  zip.file("[Content_Types].xml", ct)
}
let rels = await zip.file("word/_rels/document.xml.rels").async("string")
if (!rels.includes("/relationships/theme")) {
  rels = rels.replace("</Relationships>", '<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>')
  zip.file("word/_rels/document.xml.rels", rels)
}

const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
writeFileSync("/tmp/test-themed.docx", out)
console.log("wrote /tmp/test-themed.docx", out.length)
