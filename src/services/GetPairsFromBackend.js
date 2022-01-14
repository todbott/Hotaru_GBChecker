async function GetPairsFromBackend(sourceCode, targetCode, customerCategory, category) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          get_or_put: 'get',
          source: sourceCode,
          target: targetCode,
          s_sentence: '',
          t_sentence: '',
          b_or_k: customerCategory,
          category: category,
          associated_zuban: ''
        })
      };
      console.log(requestOptions.body)
  
      try {
        const response = await fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/getPutSentencePairForHotaru', requestOptions)
        const json = await response.json();
        return json
      } catch (e) {
        return "no pairs"
      }
}

export default GetPairsFromBackend;