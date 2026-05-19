'use client';

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [arquivo, setArquivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSelecionarArquivo = (event) => {
    setArquivo(event.target.files[0]);
    setResultado(null);
    setErro('');
  };

  const handleLimpar = () => {
    setArquivo(null);
    setResultado(null);
    setCarregando(false);
    setErro('');
  };

  const handleProcessar = async () => {
    if (!arquivo) {
      setErro('Por favor, selecione um arquivo xlsx.');
      return;
    }

    setCarregando(true);
    setErro('');

    const formData = new FormData();
    formData.append('arquivoExtrato', arquivo);

    try {
      const response = await fetch('https://aplicacao-sincro-back-end-1.onrender.com/api/taxas', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o Back-end.');
      }

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Leitor Extrato Excel Asaas</h1>
        <p className={styles.description}>
          Selecione o seu extrato em excel para calcular o total de tarifas de forma automática.
        </p>
        <div className={styles.inputWrapper}>
          <input
            key={arquivo ? 'selecionado' : 'vazio'}
            type="file"
            accept=".xlsx, .csv"
            onChange={handleSelecionarArquivo}
            className={styles.fileInput}
          />
        </div>
        <button
          onClick={handleProcessar}
          disabled={carregando || !!resultado}
          className={styles.button}
        >
          {carregando ? 'Lendo dados...' : 'Calcular Taxas'}
        </button>
        {(arquivo || resultado) && (
          <button
            onClick={handleLimpar}
            className={styles.button}
          >
            Limpar / Nova Consulta
          </button>
        )}
        {erro && <p className={styles.error}>{erro}</p>}
        {resultado && (
          <div className={styles.resultado}>
            <h2>Resultado da Extração</h2>
            <p><strong>Quantidade total de Taxas:</strong> {resultado.quantidade}</p>
            <p className={styles.total}><strong>Total geral em taxas:</strong> {resultado.totalFormatado}</p>
            {resultado.taxasPorData && resultado.taxasPorData.length > 0 && (
              <div className={styles.detalhes}>
                <h3>Resumo por Data</h3>
                <div className={styles.listaDatas}>
                  {resultado.taxasPorData.map((grupoDia, indexDia) => (
                    <div key={indexDia} className={styles.grupoDia}>
                      {/* Cabeçalho do Dia com o Total Somado do Dia */}
                      <div className={styles.headerDia}>
                        <span><strong>{grupoDia.data}</strong></span>
                        <span className={styles.totalDia}>Total: {grupoDia.totalDiaFormatado}</span>
                      </div>
                      {/* Sublista de Clientes daquele Dia */}
                      <ul className={styles.listaClientesSub}>
                        {grupoDia.clientes.map((item, indexCli) => (
                          <li key={indexCli} className={styles.itemData}>
                            <span className={styles.itemCliente}>{item.nome}</span>
                            <span className={styles.itemValor}>{item.totalFormatado}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        <p>&copy; Leandro Lopes 2026</p>
      </footer>
    </main>
  );
}