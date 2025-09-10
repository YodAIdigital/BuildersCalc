import React from 'react';
import { useSettings } from '../hooks/useSettings';
import Cabin3D from '../components/Cabin3D';
import { computeCabin, type CabinConfig } from '../lib/cabin';
import { bomToCSV } from '../lib/csv';
import { pitchWarnings } from '../lib/roofPitch';
import { renderCabinEmailHTML } from './cabinEmail';

// Allow overriding email API in dev to hit a real backend instead of Vite stub
const EMAIL_API = (import.meta as any).env?.VITE_EMAIL_API_URL || '/api/email-cabin';

const COLORSTEEL: Record<string, string> = {
  'Titania': '#dfdfcf',
  'Gull Grey': '#b9b9b6',
  'Sandstone Grey': '#8e8f8c',
  'Grey Friars': '#5a5f69',
  'New Denim Blue': '#3e5a6d',
  'FlaxPod': '#262626',
  'Ebony': '#101214',
  'Karaka': '#273021',
  'Permanent Green': '#2d5731',
  'Mist Green': '#6f8664',
  'Desert Sand': '#c9b693',
  'Scoria': '#6b2b2b',
  'Lignite': '#4a382e',
  'Ironsand': '#3a3a37',
  'Slate': '#6c6f70',
};
const COLORSTEEL_ENTRIES = Object.entries(COLORSTEEL);

export default function Cabin() {
  const { settings } = useSettings();

  // Defaults: 4 x 2 x 2.4 m
  const [length, setLength] = React.useState('4000');
  const [width, setWidth] = React.useState('2000');
  const [height, setHeight] = React.useState('2400');

  const [roofType, setRoofType] = React.useState<'flat' | 'mono' | 'dual'>('dual');
  const [pitchDeg, setPitchDeg] = React.useState('20');
  const [overhang, setOverhang] = React.useState('300');
  const [includeOverhang, setIncludeOverhang] = React.useState(true);

  const [rafterSpacing, setRafterSpacing] = React.useState('600');
  const [studSpacing, setStudSpacing] = React.useState('600');
  const [nogSpacing, setNogSpacing] = React.useState('800');
  const [joistSpacing, setJoistSpacing] = React.useState('600');
  const [bearerSpacing, setBearerSpacing] = React.useState('1800');
  const [pileSpacing, setPileSpacing] = React.useState('1500');

  const [windows, setWindows] = React.useState<{ count: number; width: number; height: number; wall: 'front' | 'back' | 'left' | 'right' }[]>([
    { count: 1, width: 1200, height: 900, wall: 'right' },
  ]);
  const [doors, setDoors] = React.useState<{ count: number; width: number; height: number }[]>([
    { count: 1, width: 860, height: 1980 },
  ]);
  const [doorWall, setDoorWall] = React.useState<'front' | 'back' | 'left' | 'right'>('front');

  const [exteriorCladding, setExteriorCladding] = React.useState(
    'corrugate'
  );
  const [lining, setLining] = React.useState<'none' | 'ply' | 'gib'>('none');
  const [insulated, setInsulated] = React.useState(false);
  const [electrical, setElectrical] = React.useState(false);

  // Roofing material (separate from walls). Same options as walls, excluding weatherboards.
  const [roofCladding, setRoofCladding] = React.useState<string>('corrugate');

  const [sheetWm, setSheetWm] = React.useState('1.2');
  const [sheetHm, setSheetHm] = React.useState('2.4');

  const [rotationDeg, setRotationDeg] = React.useState('20');
  const [panX, setPanX] = React.useState(0); // mm
  const [panY, setPanY] = React.useState(0); // mm
  const [zoom, setZoom] = React.useState(1); // 1 = 100%
  function pan(dx: number, dy: number) {
    setPanX((x) => x + dx);
    setPanY((y) => y + dy);
  }

  const [wallColourKey, setWallColourKey] = React.useState<string>('Gull Grey');
  const [roofColourKey, setRoofColourKey] = React.useState<string>('Ironsand');
  const [frameColourKey, setFrameColourKey] = React.useState<string>('Titania');
  const [interiorColour, setInteriorColour] = React.useState<string>('#e9e7e2');

  const config: CabinConfig = React.useMemo(
    () => ({
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      height: parseFloat(height) || 0,
      roofType,
      pitchDeg: roofType === 'flat' ? 0 : parseFloat(pitchDeg) || 0,
      overhang: parseFloat(overhang) || 0,
      includeOverhangInArea: includeOverhang,
      rafterSpacing: parseFloat(rafterSpacing) || 600,
      studSpacing: parseFloat(studSpacing) || 600,
      nogSpacing: parseFloat(nogSpacing) || 800,
      joistSpacing: parseFloat(joistSpacing) || 600,
      bearerSpacing: parseFloat(bearerSpacing) || 1800,
      pileSpacing: parseFloat(pileSpacing) || 1500,
      openings: { windows, doors },
      exteriorCladding: exteriorCladding as any,
      lining,
      insulated,
      electrical,
      sheetSizeM: { w: parseFloat(sheetWm) || 1.2, h: parseFloat(sheetHm) || 2.4 },
    }),
    [
      length,
      width,
      height,
      roofType,
      pitchDeg,
      overhang,
      includeOverhang,
      rafterSpacing,
      studSpacing,
      nogSpacing,
      joistSpacing,
      bearerSpacing,
      pileSpacing,
      windows,
      doors,
      exteriorCladding,
      lining,
      insulated,
      sheetWm,
      sheetHm,
      electrical,
    ]
  );

  const result = React.useMemo(() => computeCabin(config, settings), [config, settings]);

  // Derived warnings
  const rw = React.useMemo(() => pitchWarnings({ pitch: config.roofType === 'flat' ? 0 : config.pitchDeg, cladding: 'longrun' }), [config]);

  // Windows/doors handlers
  function updWindow(i: number, key: 'count' | 'width' | 'height' | 'wall', v: string) {
    setWindows((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: parseFloat(v) || 0 } : it)));
  }
  function updDoor(i: number, key: 'count' | 'width' | 'height', v: string) {
    setDoors((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: parseFloat(v) || 0 } : it)));
  }

  // CSV download
  function downloadCSV() {
    const csv = bomToCSV(result.items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cabin-bom.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Email modal state
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [emailTo, setEmailTo] = React.useState('');
  const cabinRef = React.useRef<{ snapshot: () => string | null } | null>(null);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  function handleReady(api: { snapshot: () => string | null }) {
    cabinRef.current = api;
  }
  const [pdfSending, setPdfSending] = React.useState(false);
  const pdfRef = React.useRef<HTMLDivElement | null>(null);

  async function sendEmail() {
    try {
      const snapshot = cabinRef.current?.snapshot?.() || null;
      const logoDataUri = await getLogoDataUri();
      // Prefer CID for email clients; fall back to data URI if needed inside PDF logic only
      let logoBase64: string | undefined;
      let logoContentType = 'image/png';
      if (logoDataUri) {
        const m = /^data:([^;]+);base64,(.*)$/.exec(logoDataUri);
        if (m) {
          logoContentType = m[1] || 'image/png';
          logoBase64 = m[2];
        }
      }

      const html = renderCabinEmailHTML(config, result, {
        title: 'Cabin Estimate',
        logoCid: logoBase64 ? 'cabin-logo' : undefined,
        businessName: 'Roots & Echo Ltd',
        phone: '021 180 1218',
        email: 'zeke@rootsandecho.co.nz',
      });

      const attachments: any[] = [];
      if (snapshot) {
        attachments.push({
          filename: 'cabin.png',
          contentBase64: snapshot.replace(/^data:image\/png;base64,/, ''),
          contentType: 'image/png',
        });
      }
      if (logoBase64) {
        attachments.push({
          filename: 'logo.png',
          contentBase64: logoBase64,
          contentType: logoContentType,
          cid: 'cabin-logo',
        });
      }

      const payload: any = {
        to: emailTo,
        // Keep subject unchanged for regular Email flow per instruction (only PDF email subject changes)
        subject: 'Cabin quote',
        html,
        attachments: attachments.length ? attachments : undefined,
      };
      const res = await fetch(EMAIL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to email');
      setEmailOpen(false);
      alert('Email sent');
    } catch (e) {
      alert('Failed to send email');
    }
  }

  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function getLogoDataUri(): Promise<string | undefined> {
    // Try multiple common logo locations and formats
    const tryPaths = [
      '/assets/logo.png', '/tools/logo.png',
      '/assets/logo.jpg', '/tools/logo.jpg',
      '/assets/logo.jpeg', '/tools/logo.jpeg',
      '/assets/logo.svg', '/tools/logo.svg',
    ];
    for (const p of tryPaths) {
      try {
        const resp = await fetch(p, { cache: 'no-store' });
        if (!resp.ok) continue;
        const blob = await resp.blob();
        const base64 = await blobToBase64(blob);
        return `data:${blob.type || 'image/png'};base64,${base64}`;
      } catch {
        // ignore and try next
      }
    }
    return undefined;
  }

  async function sendEmailPdf() {
    try {
      setPdfSending(true);

      // Build the same HTML as the email (with branding + disclaimer) — use data URI for PDF rendering
      const logoDataUri = await getLogoDataUri();
      const html = renderCabinEmailHTML(config, result, {
        title: 'Cabin Estimate',
        logoDataUri,
        businessName: 'Roots & Echo Ltd',
        phone: '021 180 1218',
        email: 'zeke@rootsandecho.co.nz',
      });

      // Populate the persistent off-screen container for html2pdf rendering
      if (!pdfRef.current) {
        alert('PDF renderer not ready. Please reload and try again.');
        return;
      }
      pdfRef.current.innerHTML = html;

      // Prefer server-side PDF rendering if available (more reliable on some browsers)
      try {
        const resp = await fetch('/api/render-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html }) });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.contentBase64) {
            const b64 = data.contentBase64 as string;
            const payload: any = {
              to: emailTo,
              subject: 'Cabin Estimate',
              html,
              attachments: [
                { filename: 'cabin-estimate.pdf', contentBase64: b64, contentType: 'application/pdf' },
              ],
            };
            const res = await fetch(EMAIL_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('Failed to email');
            alert('Email sent');
            return;
          }
        }
      } catch { /* fallthrough to client-side */ }

      // Client-side fallback
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: Math.min(2, (window as any).devicePixelRatio || 1), useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      } as any;

      const worker = html2pdf().set(opt).from(html).toPdf();
      const pdf = await worker.get('pdf');
      const blob: Blob = pdf.output('blob');
      const b64 = await blobToBase64(blob);

      const payload: any = {
        to: emailTo,
        // Change subject only for the Email PDF flow per instruction
        subject: 'Cabin Estimate',
        html,
        attachments: [
          {
            filename: 'cabin-estimate.pdf',
            contentBase64: b64,
            contentType: 'application/pdf',
          },
        ],
      };

      const res = await fetch(EMAIL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to email');
      alert('Email sent');
    } catch (e) {
      alert('Failed to generate or send PDF');
    } finally {
      setPdfSending(false);
    }
  }

  return (
    <section ref={sectionRef} className="space-y-6">
      <h2 className="text-2xl font-bold">Cabin</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 3D */}
        <div className="rounded-md border bg-white">
          <div className="p-2 border-b text-sm font-semibold">3D Preview</div>
          <div className="h-[360px]">
            <Cabin3D
              length={parseFloat(length) || 0}
              width={parseFloat(width) || 0}
              height={parseFloat(height) || 0}
              roofType={roofType}
              pitchDeg={roofType === 'flat' ? 0 : parseFloat(pitchDeg) || 0}
              overhang={parseFloat(overhang) || 0}
              rotationDeg={parseFloat(rotationDeg) || 0}
              windows={windows}
              doors={doors}
              doorWall={doorWall}
              wallColor={COLORSTEEL[wallColourKey]}
              roofColor={COLORSTEEL[roofColourKey]}
              cladding={exteriorCladding}
              roofCladding={roofCladding}
              panX={panX}
              panY={panY}
              zoom={zoom}
              frameColor={COLORSTEEL[frameColourKey]}
              interiorColor={interiorColour}
              onReady={handleReady}
            />
          </div>
          <div className="p-3 border-t space-y-3">
            {/* Row 1: rotation + move + zoom */}
            <div className="flex items-end gap-3">
              {/* Rotation (left, fixed width) */}
              <label className="block w-[320px] max-w-full">
                <span className="text-sm">Model rotation (°)</span>
                <input className="mt-1 w-full rounded-md border p-2" type="range" min={-180} max={180} step={1} value={rotationDeg} onChange={(e) => setRotationDeg(e.target.value)} />
              </label>

              {/* Move pad (center, fixed) */}
              <div className="flex items-center gap-2 min-w-[160px] justify-center">
                <span className="text-sm">Move</span>
                <div className="grid grid-cols-3 grid-rows-3 gap-1">
                  <div></div>
                  <button className="h-8 w-8 rounded border leading-none" onClick={() => pan(0, 200)} title="Up">↑</button>
                  <div></div>
                  <button className="h-8 w-8 rounded border leading-none" onClick={() => pan(-200, 0)} title="Left">←</button>
                  <button className="h-8 w-8 rounded border leading-none" onClick={() => { setPanX(0); setPanY(0); setZoom(1); }} title="Center">•</button>
                  <button className="h-8 w-8 rounded border leading-none" onClick={() => pan(200, 0)} title="Right">→</button>
                  <div></div>
                  <button className="h-8 w-8 rounded border leading-none" onClick={() => pan(0, -200)} title="Down">↓</button>
                  <div></div>
                </div>
              </div>

              {/* Zoom (right, fixed width) */}
              <label className="block w-[320px] max-w-full">
                <span className="text-sm">Zoom</span>
                <input className="mt-1 w-full rounded-md border p-2" type="range" min={0.5} max={2} step={0.05} value={zoom} onChange={(e)=>setZoom(parseFloat(e.target.value)||1)} />
              </label>
            </div>
            {/* Row 2: wall + roof colours */}
            <div className="flex items-end gap-3">
              <label className="block min-w-[220px] flex-1">
                <span className="text-sm">Wall colour (COLORSTEEL)</span>
                <select className="mt-1 w-full rounded-md border p-2" value={wallColourKey} onChange={(e)=>setWallColourKey(e.target.value)}>
                  {COLORSTEEL_ENTRIES.map(([k])=> (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-[220px] flex-1">
                <span className="text-sm">Roof colour (COLORSTEEL)</span>
                <select className="mt-1 w-full rounded-md border p-2" value={roofColourKey} onChange={(e)=>setRoofColourKey(e.target.value)}>
                  {COLORSTEEL_ENTRIES.map(([k])=> (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </label>
            </div>
            {/* Row 3: frame + interior colours */}
            <div className="flex items-end gap-3">
              <label className="block min-w-[220px] flex-1">
                <span className="text-sm">Frame colour (COLORSTEEL)</span>
                <select className="mt-1 w-full rounded-md border p-2" value={frameColourKey} onChange={(e)=>setFrameColourKey(e.target.value)}>
                  {COLORSTEEL_ENTRIES.map(([k])=> (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-[220px] flex-1">
                <span className="text-sm">Interior wall colour</span>
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" className="h-9 w-10 cursor-pointer" value={interiorColour} onChange={(e)=>setInteriorColour(e.target.value)} />
                  <input className="flex-1 rounded-md border p-2" value={interiorColour} onChange={(e)=>setInteriorColour(e.target.value)} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <LabeledInput label="Length (mm)" value={length} onChange={setLength} />
            <LabeledInput label="Width (mm)" value={width} onChange={setWidth} />
            <LabeledInput label="Height (mm)" value={height} onChange={setHeight} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm">Roof Type</span>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as any)}
                className="mt-1 w-full rounded-md border p-2"
              >
                <option value="flat">Flat</option>
                <option value="mono">Mono Pitch</option>
                <option value="dual">Dual Pitch</option>
              </select>
            </label>
            <LabeledInput
              label="Pitch (°)"
              value={roofType === 'flat' ? '0' : pitchDeg}
              onChange={setPitchDeg}
              disabled={roofType === 'flat'}
            />
            <LabeledInput label="Overhang (mm)" value={overhang} onChange={setOverhang} />
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={includeOverhang} onChange={(e) => setIncludeOverhang(e.target.checked)} />
              <span className="text-sm">Include overhang in roof area</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LabeledInput label="Rafter spacing (mm)" value={rafterSpacing} onChange={setRafterSpacing} />
            <LabeledInput label="Stud spacing (mm)" value={studSpacing} onChange={setStudSpacing} />
            <LabeledInput label="Nog spacing (mm)" value={nogSpacing} onChange={setNogSpacing} />
            <LabeledInput label="Joist spacing (mm)" value={joistSpacing} onChange={setJoistSpacing} />
            <LabeledInput label="Bearer spacing (mm)" value={bearerSpacing} onChange={setBearerSpacing} />
            <LabeledInput label="Pile spacing (mm)" value={pileSpacing} onChange={setPileSpacing} />
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Openings</span>
              <span className="text-xs text-slate-500">Doors default 1980 x 860 mm; Windows 1200 x 900 mm</span>
            </div>
            <div className="mt-2 space-y-4">
              <div>
                <div className="text-sm font-medium">Doors</div>
                <div className="space-y-2 mt-1">
                  {doors.map((d, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-end">
                      <input className="rounded-md border p-2" type="number" value={d.count} onChange={(e) => updDoor(i, 'count', e.target.value)} placeholder="Count" />
                      <input className="rounded-md border p-2" type="number" value={d.width} onChange={(e) => updDoor(i, 'width', e.target.value)} placeholder="Width" />
                      <input className="rounded-md border p-2" type="number" value={d.height} onChange={(e) => updDoor(i, 'height', e.target.value)} placeholder="Height" />
                      <select className="rounded-md border p-2" value={doorWall} onChange={(e) => setDoorWall(e.target.value as any)}>
                        <option value="front">Front (+Z)</option>
                        <option value="back">Back (−Z)</option>
                        <option value="left">Left (−X)</option>
                        <option value="right">Right (+X)</option>
                      </select>
                    </div>
                  ))}
                  <button className="text-pink-700 text-sm" onClick={() => setDoors((a) => [...a, { count: 1, width: 860, height: 1980 }])}>+ Add Door</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Windows</div>
                <div className="space-y-2 mt-1">
                  {windows.map((w, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-end">
                      <input className="rounded-md border p-2" type="number" value={w.count} onChange={(e) => updWindow(i, 'count', e.target.value)} placeholder="Count" />
                      <input className="rounded-md border p-2" type="number" value={w.width} onChange={(e) => updWindow(i, 'width', e.target.value)} placeholder="Width" />
                      <input className="rounded-md border p-2" type="number" value={w.height} onChange={(e) => updWindow(i, 'height', e.target.value)} placeholder="Height" />
                      <select className="rounded-md border p-2" value={w.wall} onChange={(e) => updWindow(i, 'wall', e.target.value)}>
                        <option value="front">Front (+Z)</option>
                        <option value="back">Back (−Z)</option>
                        <option value="left">Left (−X)</option>
                        <option value="right">Right (+X)</option>
                      </select>
                    </div>
                  ))}
                  <button className="text-pink-700 text-sm" onClick={() => setWindows((a) => [...a, { count: 1, width: 1200, height: 900, wall: 'right' }])}>+ Add Window</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm">Exterior cladding</span>
              <select value={exteriorCladding} onChange={(e) => setExteriorCladding(e.target.value)} className="mt-1 w-full rounded-md border p-2">
                <option value="ply">Ply</option>
                <option value="corrugate">Corrugate</option>
                <option value="tray">Tray (longrun)</option>
                <option value="five rib">5 rib</option>
                <option value="PIR">PIR</option>
                <option value="cedar weatherboard">Cedar weatherboard</option>
                <option value="standard weatherboard">Standard weatherboard</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm">Roofing material</span>
              <select value={roofCladding} onChange={(e) => setRoofCladding(e.target.value)} className="mt-1 w-full rounded-md border p-2">
                <option value="ply">Ply</option>
                <option value="corrugate">Corrugate</option>
                <option value="tray">Tray (longrun)</option>
                <option value="five rib">5 rib</option>
                <option value="PIR">PIR</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm">Internal lining</span>
              <select value={lining} onChange={(e) => setLining(e.target.value as any)} className="mt-1 w-full rounded-md border p-2">
                <option value="none">None</option>
                <option value="ply">Ply</option>
                <option value="gib">GIB</option>
              </select>
            </label>
            {lining !== 'none' && (
              <label className="inline-flex items-center gap-2 self-end">
                <input type="checkbox" checked={insulated} onChange={(e) => setInsulated(e.target.checked)} />
                <span className="text-sm">Insulate walls + ceiling</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={electrical} onChange={(e) => setElectrical(e.target.checked)} />
              <span className="text-sm">Include electrical</span>
            </label>
          </div>

          <details className="rounded-md border p-3">
            <summary className="cursor-pointer text-sm font-semibold">Sheet size (for sheet goods)</summary>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <LabeledInput label="Sheet W (m)" value={sheetWm} onChange={setSheetWm} />
              <LabeledInput label="Sheet H (m)" value={sheetHm} onChange={setSheetHm} />
            </div>
          </details>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
              <ul className="list-disc pl-5 space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
      </div>

      {/* Results */}
      <div className="rounded-md border bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Materials & Costs</h3>
          <div className="flex items-center gap-2">
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={downloadCSV}>Export CSV</button>
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => window.print()}>Print</button>
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setEmailOpen(true)}>Email</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Category</th>
                <th className="p-2">Item</th>
                <th className="p-2">Unit</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((it, i) => (
                <tr key={i} className="odd:bg-slate-50">
                  <td className="p-2">{it.category}</td>
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">{it.unit}</td>
                  <td className="p-2 text-right">{it.qty}</td>
                  <td className="p-2 text-right">${it.rate}</td>
                  <td className="p-2 text-right font-medium">${it.subtotal}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-2" colSpan={4}></td>
                <td className="p-2 text-right">Subtotal (ex GST)</td>
                <td className="p-2 text-right font-semibold">${result.totals.exGst}</td>
              </tr>
              <tr>
                <td className="p-2" colSpan={4}></td>
                <td className="p-2 text-right">GST</td>
                <td className="p-2 text-right font-semibold">${result.totals.gst}</td>
              </tr>
              <tr>
                <td className="p-2" colSpan={4}></td>
                <td className="p-2 text-right">Total (incl GST)</td>
                <td className="p-2 text-right font-bold">${result.totals.inclGst}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Email PDF inline control under pricing breakdown */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-end">
          <label className="block w-full sm:w-auto">
            <span className="text-sm mr-2">Email quote to</span>
            <input
              className="mt-1 w-full sm:w-64 rounded-md border p-2"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="name@example.com"
              type="email"
              inputMode="email"
              aria-label="Email quote to"
            />
          </label>
          <button
            className="rounded-md bg-pink-700 text-white px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-pink-800"
            onClick={sendEmailPdf}
            disabled={pdfSending || !emailTo}
            aria-busy={pdfSending}
          >
            {pdfSending ? 'Sending…' : 'Email PDF'}
          </button>
        </div>
      </div>

      {/* Email modal */}
      {emailOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-md">
            <div className="p-3 border-b font-semibold">Email quote</div>
            <div className="p-3 space-y-3">
              <label className="block">
                <span className="text-sm">Recipient email</span>
                <input className="mt-1 w-full rounded-md border p-2" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="name@example.com" />
              </label>
              <p className="text-xs text-slate-500">We’ll include a 3D snapshot and a breakdown of materials, costs, and warnings.</p>
            </div>
            <div className="p-3 border-t flex justify-end gap-2">
              <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setEmailOpen(false)}>Cancel</button>
              <button className="rounded-md bg-pink-700 text-white px-3 py-1.5 text-sm" onClick={sendEmail}>Send</button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Guidance only. Verify against NZS 3604 and manufacturer specifications.
      </p>
    {/* Off-screen container used for PDF rendering of the email HTML */}
    {/* Intentionally kept attached to document for stability during html2pdf capture */}
    <div
      aria-hidden="true"
      ref={pdfRef as any}
      style={{ position: 'fixed', left: '-10000px', top: 0, width: '800px', background: '#ffffff', color: '#0f172a' }}
    />
    </section>
  );
}

function LabeledInput({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm">{label}</span>
      <input className="mt-1 w-full rounded-md border p-2" type="number" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </label>
  );
}

