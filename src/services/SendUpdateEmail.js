function SendUpdateEmail(shinkiOrSaihonyaku, zuban, sourceKanji, targetKanji, numberOfUpdates, numberOfAdditions, BorK) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shinki_or_saihonyaku: shinkiOrSaihonyaku,
          zuban: zuban,
          source: sourceKanji,
          target: targetKanji,
          updates: numberOfUpdates,
          additions: numberOfAdditions,
          BorK: BorK
        })
      };
      console.log(requestOptions.body);
      fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/sendEmailToHotaru', requestOptions)
        .then(response => response.json())
        .then(data => console.log(data));
}

export default SendUpdateEmail;