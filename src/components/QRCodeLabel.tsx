import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Box } from '../lib/storage';
import { Globe, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface QRCodeLabelProps {
    box: Box;
}

export const QRCodeLabel: React.FC<QRCodeLabelProps> = ({ box }) => {
    const [customHost, setCustomHost] = useState(window.location.origin);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Label_${box.name}`,
    });

    // Deep link to the box in the PWA
    const boxUrl = `${customHost}/box/${box.id}`;

    return (
        <div className="qr-label-container">
            <div className="qr-config glass">
                <Globe size={18} />
                <input
                    type="text"
                    value={customHost}
                    onChange={e => setCustomHost(e.target.value)}
                    placeholder="Enter network IP (e.g. http://192.168.1.50:5173)"
                />
                <p className="config-hint">Match this to your network address for mobile access</p>
                <button className="btn-print-mini" onClick={() => handlePrint()}>
                    <Printer size={16} />
                    Print Label
                </button>
            </div>

            <div ref={componentRef} className="qr-label-printable">
                <div className="qr-label glass">
                    <div className="qr-header">
                        <div className="qr-title">{box.name}</div>
                        <div className="qr-dims">{box.rows}x{box.cols} Grid</div>
                    </div>
                    <div className="qr-code-wrapper">
                        <QRCodeSVG
                            value={boxUrl}
                            size={128}
                            level="H"
                            includeMargin={true}
                            bgColor="#ffffff"
                            fgColor="#000000"
                        />
                    </div>
                    <div className="qr-footer">
                        BIO-STORAGE SYSTEM v1.1
                        <br />
                        ID: {box.id.substring(0, 8)}
                    </div>
                </div>
            </div>
            <p className="print-hint">Scan with mobile app to view contents</p>
        </div>
    );
};
