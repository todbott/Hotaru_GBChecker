async function SendPairsToBackend(sourceCode, targetCode, ssegs, tsegs, customerCategory, category, zuban) {
    const requestOptionsPut = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          get_or_put: 'put',
          source: sourceCode,
          target: targetCode,
          s_sentence: ssegs,
          t_sentence: tsegs,
          b_or_k: customerCategory,
          category: category,
          associated_zuban: zuban
        })
      };
      console.log(requestOptionsPut.body);
      fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/getPutSentencePairForHotaru', requestOptionsPut)
}

export default SendPairsToBackend;