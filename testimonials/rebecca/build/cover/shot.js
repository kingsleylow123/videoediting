const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const v of ['a','b','c']){await p.goto('file://'+path.resolve(__dirname,'cover.html')+'#'+v);await p.reload();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);await p.screenshot({path:path.join(process.argv[2],`cover_${v}.png`)});}
await b.close();})();
