import React from 'react';
import { X, ThermometerSnowflake } from 'lucide-react';

interface FreezerTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreezerTipsModal: React.FC<FreezerTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ThermometerSnowflake className="w-5 h-5 text-cyan-700" />
            <h3 className="text-base font-bold text-slate-900">
              Fryser-viden & Forebyggelse af madspild
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              1. Bliver mad for gammelt ved -18°C?
            </h4>
            <p>
              Ifølge Fødevarestyrelsen og fødevareforskere er frossen mad holdbart mikrobiologisk uendeligt længe ved konstant -18°C eller koldere, fordi bakterievækst standses helt. "Bedst før"-datoerne i FrostVault angiver perioden for optimal smag, saftighed og tekstur, før maden mister smag eller tørrer ud.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              2. Sådan undgår du frostskader (frysebrænding)
            </h4>
            <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
              <li>
                <strong>Fjern al luft:</strong> Ilt er fryserens værste fjende. Brug vakuumpakker eller pres al luften ud af kraftige fryseposer.
              </li>
              <li>
                <strong>Køl maden helt ned først:</strong> Læg aldrig varm suppe eller varme rester direkte i fryseren. Det opvarmer de omkringliggende varer og danner iskrystaller.
              </li>
              <li>
                <strong>Dobbeltemballage til kød:</strong> Pak f.eks. kød i slagterpapir eller folie først, og læg det derefter i en tæt frysepose.
              </li>
              <li>
                <strong>Efterlad ekspansionsplads ved væsker:</strong> Supper, saucer og fond udvider sig ca. 10% når de fryser til is. Efterlad altid 2-3 cm luft i glasbøtter, så de ikke sprænger.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              3. De 3 sikre måder at tø op på
            </h4>
            <div className="space-y-2 mt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900 block">I køleskabet (Anbefalet):</span>
                <span>Giver en jævn og skånsom optøning, hvor kødets kødsaft bevares bedst.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900 block">Koldt vandbad (Hurtigere):</span>
                <span>Læg en helt tæt pose i koldt vand fra hanen. Skift vandet hver 30. minut.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900 block">Aldrig på køkkenbordet:</span>
                <span>Optøning ved stuetemperatur skaber hurtig bakterievækst på overfladen, mens kernen stadig er frossen.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Forstået, tak!
          </button>
        </div>
      </div>
    </div>
  );
};
