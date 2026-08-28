import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Share2, ExternalLink, Smartphone } from 'lucide-react';

interface QRCodeDisplayProps {
  paymentUrl: string;
  amountFiat: string;
  amountUSDC: string;
  rideReference: string;
  onSimulatePassengerScan?: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  paymentUrl,
  amountFiat,
  amountUSDC,
  rideReference,
  onSimulatePassengerScan,
}) => {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${window.location.origin}${paymentUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OKADA Ride Payment - ${rideReference}`,
          text: `Pay ${amountFiat} (${amountUSDC}) for your OKADA ride:`,
          url: fullUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* High Quality QR Frame */}
      <div className="p-5 bg-white rounded-3xl shadow-2xl shadow-emerald-950/50 border-4 border-emerald-500/30 flex flex-col items-center relative group">
        <QRCodeSVG
          value={fullUrl}
          size={230}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/okada-icon.svg',
            x: undefined,
            y: undefined,
            height: 48,
            width: 48,
            excavate: true,
          }}
        />
        <div className="mt-3 text-center">
          <span className="text-[11px] font-mono font-bold text-slate-800 tracking-wider">
            {rideReference}
          </span>
        </div>
      </div>

      {/* Share / Copy Options */}
      <div className="mt-5 w-full flex items-center space-x-2">
        <button
          onClick={handleCopy}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy Pay Link</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-900/30 transition"
          title="Share via WhatsApp or SMS"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Instant Demo Simulator Action */}
      {onSimulatePassengerScan && (
        <button
          onClick={onSimulatePassengerScan}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Open Passenger View in Tab</span>
          <ExternalLink className="w-3 h-3 text-emerald-400/80" />
        </button>
      )}
    </div>
  );
};
