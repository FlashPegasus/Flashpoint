import React, { useState } from 'react';
import { exportBackup, importBackup, resetAllDecks } from '../../services/vault/db';
import { X, Download, Upload, AlertTriangle, Check, RefreshCw } from 'lucide-react';

interface BackupModalProps {
  onDataChanged: () => void;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onDataChanged, onClose }) => {
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleExport = async () => {
    try {
      const jsonString = await exportBackup();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commander-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setIsError(true);
      setImportMessage(`Erro ao exportar: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = await importBackup(content);
      setIsError(!res.success);
      setImportMessage(res.message);
      if (res.success) {
        onDataChanged();
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    await resetAllDecks();
    onDataChanged();
    setShowConfirmReset(false);
    setIsError(false);
    setImportMessage('Todos os 32 decks foram resetados com sucesso.');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title-wrap">
            <RefreshCw size={20} className="text-gold" />
            <h2 className="modal-header__title">Backup & Dados</h2>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {importMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 8,
                background: isError ? 'rgba(211, 32, 42, 0.2)' : 'rgba(56, 214, 122, 0.2)',
                border: `1px solid ${isError ? '#d3202a' : '#38d67a'}`,
                color: isError ? '#ff7075' : '#38d67a',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {isError ? <AlertTriangle size={16} /> : <Check size={16} />}
              <span>{importMessage}</span>
            </div>
          )}

          {/* Export Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--gold-bright)' }}>Exportar Backup</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Baixe todos os seus 32 decks, notas e comandantes em um arquivo JSON. Este arquivo é 100% compatível com o Commander Vault original.
            </p>
            <div>
              <button type="button" className="btn btn--primary" onClick={handleExport}>
                <Download size={16} /> Baixar Arquivo JSON
              </button>
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(197, 160, 89, 0.2)', margin: '0.5rem 0' }} />

          {/* Import Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--gold-bright)' }}>Restaurar / Importar Backup</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Selecione um arquivo de backup JSON para restaurar seus decks. Seus dados existentes serão atualizados.
            </p>
            <label className="btn btn--secondary" style={{ cursor: 'pointer', alignSelf: 'flex-start' }}>
              <Upload size={16} /> Selecionar Arquivo JSON
              <input type="file" accept=".json,application/json" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <hr style={{ borderColor: 'rgba(197, 160, 89, 0.2)', margin: '0.5rem 0' }} />

          {/* Danger Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#ff7075' }}>Zona de Perigo</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Limpar todas as informações de todos os 32 decks e voltar ao estado inicial vazio.
            </p>
            {showConfirmReset ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: '#d3202a', color: '#fff' }}
                  onClick={handleReset}
                >
                  Confirmar e Apagar Tudo
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowConfirmReset(false)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn--ghost"
                style={{ color: '#ff7075', borderColor: 'rgba(211, 32, 42, 0.3)', alignSelf: 'flex-start' }}
                onClick={() => setShowConfirmReset(true)}
              >
                Resetar Todos os Decks
              </button>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
