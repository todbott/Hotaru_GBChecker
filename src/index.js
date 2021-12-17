import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Slider from '@material-ui/core/Slider'



class ShowTmx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      TmxContents: props.TmxContents,
      whichPair: props.fromWhere,
      source: props.TmxContents[0][0],
      toTranslate: props.TmxContents[0][1],
      translated: "",
      problemSegments: ['Source\tTarget\tQuestion\tResponse or Retranslation'],
      allSegments: ['Source\tTarget\tGB\tCheck'],
      comment: "",
      show: false,
      cutoff: 100,
      leftSideRightSide: props.sourceCode,
      middle: props.targetCode,
    }

    this.nextRef = React.createRef();


    this.userLanguage = this.state.leftSideRightSide
    this.API_KEY = props.apiKey
    this.URL = `https://translation.googleapis.com/language/translate/v2?key=${this.API_KEY}&source=${this.state.middle}`
    this.URL += `&target=${this.userLanguage}`

    this.handleNextClick = this.handleNextClick.bind(this);
    this.handleProblemClick = this.handleProblemClick.bind(this);
    this.handleStopClick = this.handleStopClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.translate = this.translate.bind(this);
  }

  handleNextClick() {
    var oldPair = this.state.whichPair
    var newPair = oldPair += 1
    this.setState({whichPair: newPair});

    if (newPair >= this.state.TmxContents.length) {
      this.downloadFile()
      this.setState({show: true})
    } else {

      let contents = this.state.TmxContents;
      this.setState({toTranslate: contents[newPair][1]})
      this.setState({source: contents[newPair][0]})
      this.setState({comment: ""})
      this.translate('&q=' + encodeURI(contents[newPair][1]), contents[newPair][0])
    }
  }

  handleProblemClick() {
    let ps = this.state.problemSegments;
    let stringToPush = this.state.source + "\t" + this.state.toTranslate + "\t" + this.state.comment
    ps.push(stringToPush)
    this.setState({problemSegments: ps})
   
    this.handleNextClick();
  }

  handleStopClick() {
    this.downloadFile()
    this.setState({show: true})
  }

  handleClose() {
    
    ReactDOM.render(
      <React.StrictMode>
        <CheckOrEdit />
      </React.StrictMode>,
      document.getElementById('root')
    );
  }



  componentWillMount() {
    this.translate('&q=' + encodeURI(this.state.toTranslate), this.state.source)
  }

  downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([this.state.problemSegments.join("\n")],    
                {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = "要確認.tsv";
    document.body.appendChild(element);
    element.click();


    const elementTwo = document.createElement("a");
    const fileTwo = new Blob([this.state.allSegments.join("\n")],    
                {type: 'text/plain;charset=utf-8'});
    elementTwo.href = URL.createObjectURL(fileTwo);
    elementTwo.download = "GBCheck_図番.tsv";
    document.body.appendChild(elementTwo);
    elementTwo.click(); 

  }

  translate = (string_to_translate, original_string) => {

    const requestOptions = {
      method: 'POST'
    };
    fetch(this.URL+string_to_translate, requestOptions)
      .then(res => res.json())
      .then(
        ( res ) => { 
         
          let text = res.data.translations[0].translatedText.replace(/(&quot;)/g,"\"")
          this.setState({translated: text})
          let splitTranslated = text.split('')
          let splitOriginal = original_string.split('')
          const filteredArray = splitTranslated.filter(value => splitOriginal.includes(value));
          let diff = Math.abs(filteredArray.length - splitOriginal.length)
          let match = 100 - diff * 100/splitOriginal.length

          //put the segments into the GBCheck file
          let allSegs = this.state.allSegments;
          let stringToPush = this.state.source + "\t" + this.state.toTranslate + "\t" + this.state.translated + "\t✔"
          allSegs.push(stringToPush)
          this.setState({allSegments: allSegs})
      
          if (match >= this.state.cutoff) {
            this.handleNextClick();
          }
        }      
      ).catch(
          ( error ) => { 
            console.log("There was an error: ", error); 
          }
        )
  }
  

  render() {
    
    return (
      <Container>
        <Modal show={this.state.show}>
					<Modal.Header closeButton>
						<Modal.Title>休憩もしくは終わり</Modal.Title>
					</Modal.Header>
						<Modal.Body>
							全セグメントがチェック済か「ここにストップ」がクリックされました。再翻訳必須と思われる原文・訳文ペアリストがダウンロードフォルダに保存されました (要確認.tsv)。出向者用の逆引きチェックファイルもダウンロードされました (GBCheck_図番.tsv)。
						</Modal.Body>
					<Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
						Close
					</Button>
					</Modal.Footer>
				</Modal>
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
            マッチ率が <span style={{color: 'red', fontWeight: 'bold', margin: '5px'}}>{this.state.cutoff}%</span> 以下しか表示しない
          </Col>
        </Row>
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
          <Slider 
            defaultValue={100} 
            aria-label="Default" 
            valueLabelDisplay="auto"
            onChange={ (_e, val) => {
              
              this.setState({cutoff: val})
            }}
              />
          </Col>
        </Row>
        
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
            {this.state.whichPair} / {this.state.TmxContents.length}
          </Col>
        </Row>
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              <Button variant="success" size="lg" ref={this.nextRef} onClick={this.handleNextClick}>次</Button>
          </Col>
        </Row>      
        <Row>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="block-example border border-primary">
            {this.state.source}
          </Col>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="block-example border border-primary">
            {this.state.translated}
          </Col>
        </Row>
        <Row style={{ marginTop: 50, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
              <Form.Control as="textarea" value={this.state.comment} rows={3} columns={200} onChange={(e) => this.setState({comment: e.target.value})} />
          </Col>
        </Row>
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">       
            <Button variant="warning" size="lg" onClick={this.handleProblemClick}>コメントを付けて、再翻訳リストに追加</Button>
          </Col>
        </Row> 
        <Row style={{ marginTop: 50, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              <Button variant="danger" size="sm" onClick={this.handleStopClick}>ここにストップ（休憩）</Button>
          </Col>
        </Row>       
      </Container>
    );
  }
}

class CheckOrEdit extends React.Component {

  constructor(props) {
    super(props);
    this.handleCheckClick = this.handleCheckClick.bind(this);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.handleMergeClick = this.handleMergeClick.bind(this);
  }
  
  handleCheckClick() {
    ReactDOM.render(
      <React.StrictMode>
        <GetTmx />
      </React.StrictMode>,
      document.getElementById('root')
    );
  }

    handleUpdateClick() {
      ReactDOM.render(
        <React.StrictMode>
          <UpdateTmx />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }

    handleMergeClick() {
      ReactDOM.render(
        <React.StrictMode>
          <MergeTmx />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
    render() {
      return (
        <Container>
          <Row style={{ marginTop: 50, marginBottom: 5}}>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
            納品されたトラドスプロジェクトから *.tmx ファイルを抽出してから...
            </Col>
          </Row>
          <Row>
				    <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              <Button variant="secondary" size="lg" onClick={this.handleCheckClick}>逆引きチェックを行う</Button>
            </Col>
          </Row>
          <Row style={{ marginTop: 50, marginBottom: 5}}>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
            上記の逆引きチェックによってもし誤訳がありましたら、再翻訳が翻訳会社から頂いてから...
            </Col>
          </Row>
          <Row>
				    <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              <Button variant="warning" size="lg" onClick={this.handleUpdateClick}>再翻訳によってメモリを更新</Button>
            </Col>
          </Row>
          <Row style={{ marginTop: 50, marginBottom: 5}}>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
            逆引きチェックによる誤訳がない場合、納品されたトラドスプロジェクトから *.tmx ファイル（またはただの原文・訳文テキスト）を使って...
            </Col>
          </Row>
          <Row>
            <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              <Button variant="success" size="lg" onClick={this.handleMergeClick}>メイン翻訳メモリを更新</Button>
            </Col>
          </Row>  
        </Container>
      )}

  }



class GetTmx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      apiKey: "",
      sourceCode: "en",
      targetCode: "en",
      sourceKanji: "英語",
      targetKanji: "英語",
      fromWhere: 0
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const reader = new FileReader()
    reader.onload = async (event) => { 
      const text = (event.target.result)

      var allForReturn = []
      var oneForReturn = []

      var XMLParser = require('react-xml-parser');
      var xml = new XMLParser().parseFromString(text);    
      var allTuvs = xml.getElementsByTagName('tuv');
      for (var t = 0; t < allTuvs.length; t++) {
        if (allTuvs[t].attributes['xml:lang'].indexOf(this.state.sourceCode) > -1) {
          oneForReturn.push(allTuvs[t].getElementsByTagName('seg')[0].value)
        } else {
          oneForReturn.push(allTuvs[t].getElementsByTagName('seg')[0].value)
          allForReturn.push(oneForReturn)
          oneForReturn = []
        }
      }

      ReactDOM.render(
        <React.StrictMode>
          <ShowTmx TmxContents={allForReturn} apiKey={this.state.apiKey} fromWhere={parseInt(this.state.fromWhere)} sourceCode={this.state.sourceCode} targetCode={this.state.targetCode} />
        </React.StrictMode>,
        document.getElementById('root')
      );
    };
    reader.readAsText(this.state.value)
  }

  render() {
    return (
      <Container>
        <Form>
          <Form.Group controlId="formFile" className="mb-3">
          <Row style={{ marginTop: 5, marginBottom: 5}}>
            <Col className="d-grid gap-2">    
              <Form.Label style={{ marginTop: 5, marginBottom: 5}}>逆引きチェックしたい*.tmxファイルを選んでください</Form.Label>
              <br />
              <Form.Control type="file" onChange={(e) => this.setState({value: e.target.files[0]})} />
            </Col>
          </Row>
          <Row style={{ marginTop: 5, marginBottom: 5}}>
            <Col className="d-grid gap-2">    
              <Form.Label style={{ marginTop: 5, marginBottom: 5}}>暗号コードを入力してください</Form.Label>
              <br />
              <Form.Control type="text" onChange={(e) => this.setState({apiKey: e.target.value})} />
            </Col>
          </Row>
          <Row style={{ marginTop: 5, marginBottom: 5}}>
            <Col className="d-grid gap-2">    
              <Form.Label style={{ marginTop: 5, marginBottom: 5}}>ソース言語を選んでくください</Form.Label>
              <br />
              <select onChange={(e) => {
                  this.setState({sourceCode: e.target.value});
                  this.setState({sourceKanji: e.target.options[e.target.selectedIndex].text})
                }}>
                    <option value="en">英語</option>
                    <option value="fr">フランス語</option>
                    <option value="es">スペイン語</option>
                    <option value="ja">日本語</option>
                    <option value="zh">繁体字</option>
                    <option value="zh">簡体字</option>
                    <option value="ko">韓国語</option>
                    <option value="pt">ポルトガル語</option>
                    <option value="el">ギリシャ</option>
                    <option value="nl">オランダ語</option>
                    <option value="de">ドイツ語</option>
                    <option value="ru">ロシア語</option>
                    <option value="it">イタリア語</option>
                    <option value="pl">ポーランド語</option>
                    <option value="tr">トルコ語</option>
                </select>
                </Col>
              </Row>

              <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col className="d-grid gap-2">    


                  <Form.Label style={{ marginTop: 5, marginBottom: 5}}>ターゲット言語をえらんでください</Form.Label>
                  <br />
                  <select onChange={(e) => {
                      this.setState({targetCode: e.target.value});
                      this.setState({targetKanji: e.target.options[e.target.selectedIndex].text})
                    }}>
                        <option value="en">英語</option>
                        <option value="fr">フランス語</option>
                        <option value="es">スペイン語</option>
                        <option value="ja">日本語</option>
                        <option value="zh">繁体字</option>
                        <option value="zh">簡体字</option>
                        <option value="ko">韓国語</option>
                        <option value="pt">ポルトガル語</option>
                        <option value="el">ギリシャ</option>
                        <option value="nl">オランダ語</option>
                        <option value="de">ドイツ語</option>
                        <option value="ru">ロシア語</option>
                        <option value="it">イタリア語</option>
                        <option value="pl">ポーランド語</option>
                        <option value="tr">トルコ語</option>
                    </select>  
                  </Col>
                </Row> 
                <Row style={{ marginTop: 5, marginBottom: 5}}>
                  <Col className="d-grid gap-2">    

                    <Form.Label style={{ marginTop: 5, marginBottom: 5}}>始めたいセグメント番号を入力してください</Form.Label>
                    <br />
                    <Form.Control type="text" onChange={(e) => this.setState({fromWhere: e.target.value})} />
                  </Col>
                </Row>
                <Row style={{ marginTop: 5, marginBottom: 5}}>
                  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    

                    <Button style={{ marginTop: 5, marginBottom: 5}} variant="secondary" type="submit" onClick={this.handleSubmit} >
                      Submit
                    </Button>
                  </Col>
                </Row>
          </Form.Group>
        </Form>
      </Container>
    );
  }
}


class UpdateTmx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      modalTitle: "",
      modalBody: "",
      value: null,
      fileName: "",
      forSearch: "",
      thisTarget: "",
      segmentArray: [],

      numberOfUpdates: 0,
      showSearchArea: false,
      zuban: "",
      sourceCode: "en",
      targetCode: "en",

      BorK: '',

      sourceKanji: "英語",
      targetKanji: "英語"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.handleDownloadClick = this.handleDownloadClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleSearchClick() {
    if (this.state.segmentArray.indexOf(this.state.forSearch) > -1) {
      let foundIt = this.state.segmentArray[this.state.segmentArray.indexOf(this.state.forSearch)+1]
      this.setState({thisTarget: foundIt})
    }
  }

  handleUpdateClick() {
    let sa = this.state.segmentArray;
    sa[sa.indexOf(this.state.forSearch)+1] = this.state.thisTarget;
    this.setState({segmentArray: sa})
    this.setState({modalTitle: "更新された"})
    this.setState({modalBody: "このセグメントペアが更新されました"})
    let nu = this.state.numberOfUpdates;
    nu+=1
    this.setState({numberOfUpdates: nu})
    this.setState({show: true})
  }

  handleSubmit(event) {
    event.preventDefault();
    const reader = new FileReader()
    reader.onload = async (event) => { 
      const contents = (event.target.result)   
      
      var allSegments = []

      var XMLParser = require('react-xml-parser');
      var xml = new XMLParser().parseFromString(contents);    
      var allTuvs = xml.getElementsByTagName('tuv');
      for (var t = 0; t < allTuvs.length; t++) {
        if (allTuvs[t].attributes['xml:lang'].indexOf(this.state.sourceCode) > -1) {
          allSegments.push(allTuvs[t].getElementsByTagName('seg')[0].value)
        } else {
          allSegments.push(allTuvs[t].getElementsByTagName('seg')[0].value)
        }
      }
      this.setState({segmentArray: allSegments})
      // -----------------------------------------
      this.setState({showSearchArea: true})
    };
    reader.readAsText(this.state.value)
  }

  handleDownloadClick() {

    // put the XML back together
    var finalXml = `<?xml version="1.0" encoding="utf-8"?><tmx version="1.4"><header creationtool="Hotaru_GBChecker" creationtoolversion="6.1" datatype="tmx" segtype="sentence" o-tmf="GlossaryFile" srclang="${this.state.sourceCode}"/><body>`
    let sa = this.state.segmentArray;
    for (var i = 0; i < sa.length; i = i + 2) {
      finalXml = finalXml + `<tu tuid="${i}"><tuv xml:lang="${this.state.sourceCode}"><seg>` + sa[i] + `</seg></tuv><tuv xml:lang="${this.state.targetCode}"><seg>` + sa[i+1] + `</seg></tuv></tu>`
    };
    finalXml = finalXml + `</body></tmx>`
   
    const element = document.createElement("a");
    const file = new Blob([finalXml],    
                {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    let fnString = this.state.fileName.replace(".tmx", "") + "_" + this.state.numberOfUpdates + "_segments_updated.tmx"
    element.download = fnString;
    document.body.appendChild(element);
    element.click();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        shinki_or_saihonyaku: 'saihonyaku',
        zuban: this.state.zuban,
        source: this.state.sourceKanji,
        target: this.state.targetKanji,
        memory: this.state.fileName,
        updates: this.state.numberOfUpdates,
        additions: '0',
        BorK: this.state.BorK
      })
    };
    fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/sendEmailToHotaru', requestOptions)
      .then(response => response.json())
      .then(data => console.log(data));


    this.setState({show: true})
    this.setState({modalTitle: "Complete"})
    this.setState({modalBody: "更新された*.tmx ファイルがダウンロードフォルダに保存されました。その上、「メモリ更新」 がトッドに送信されました。"})
  }

  handleClose() {
		this.setState({show: false})
   
    this.setState({forSearch: ""});
    this.setState({thisTarget: ""});
    if (this.state.modalTitle === "Complete") {
      ReactDOM.render(
        <React.StrictMode>
          <CheckOrEdit />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
	}

  render() {
    return (
      <Container>
        <Modal show={this.state.show} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>{this.state.modalTitle}</Modal.Title>
					</Modal.Header>
						<Modal.Body>
							{this.state.modalBody}
						</Modal.Body>
					<Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
						Close
					</Button>
					</Modal.Footer>
				</Modal>
        { this.state.showSearchArea ? 
         (
        <Container>
          <Row style={{ marginTop: 5, marginBottom: 5}}>
            <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
                <span style={{color: 'green', fontWeight: 'bold', margin: '5px'}}>{this.state.fileName}</span>を修正しています
            </Col>
          </Row>
          <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
              更新になった文章数: <span style={{color: 'red', fontWeight: 'bold', margin: '5px'}}>{this.state.numberOfUpdates}</span>
          </Col>
        </Row>
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
              ソース内容を入力してから、「検索」をクリック
          </Col>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
              ターゲットを編集してから、「更新」をクリック
          </Col>
        </Row>
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
              <Form.Control as="textarea" 
              value={this.state.forSearch} 
              rows={3} 
              columns={200} 
              onChange={(e) => this.setState({forSearch: e.target.value})} />
          </Col>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
              <Form.Control as="textarea" value={this.state.thisTarget} rows={3} columns={200} onChange={(e) => this.setState({thisTarget: e.target.value})} />
          </Col>
        </Row>
        <Row style={{ marginTop: 5, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
            <Button variant="warning" size="sm" onClick={this.handleSearchClick}>検索</Button>
          </Col>
          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
            <Button variant="warning" size="sm" onClick={this.handleUpdateClick}>更新</Button>
          </Col>
        </Row>         
        <Row style={{ marginTop: 50, marginBottom: 5}}>
				  <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
            <Button variant="success" size="lg" onClick={this.handleDownloadClick}>更新が完了</Button>
          </Col>
        </Row>
        </Container>
        ) : (
          
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
            <Row style={{ marginTop: 5, marginBottom: 5}}>
				      <Col className="d-grid gap-2">     

              <Form.Label style={{ marginTop: 5, marginBottom: 5}}>*.tmxファイルを選んでください</Form.Label>
                <br />
                <Form.Control 
                  type="file" 
                  onChange={(e) => {
                    this.setState({value: e.target.files[0]});
                    this.setState({fileName: e.target.files[0].name})}
                   } />
                </Col>
              </Row>
              <Row style={{ marginTop: 5, marginBottom: 5}}>
				        <Col className="d-grid gap-2">     


                <Form.Label style={{ marginTop: 5, marginBottom: 5}}>図番を入力してください</Form.Label>
                <br />
                <Form.Control type="text" onChange={(e) => this.setState({zuban: e.target.value})} />
                </Col>
              </Row>

              <Row style={{ marginTop: 5, marginBottom: 5}}>
				        <Col className="d-grid gap-2">     


                <Form.Label style={{ marginTop: 5, marginBottom: 5}}>ソース言語を選んでくください</Form.Label>
                <br />
                <select onChange={(e) => {
                  this.setState({sourceCode: e.target.value});
                  this.setState({sourceKanji: e.target.options[e.target.selectedIndex].text})
                }}>
                    <option value="en">英語</option>
                    <option value="fr">フランス語</option>
                    <option value="es">スペイン語</option>
                    <option value="ja">日本語</option>
                    <option value="zh">繁体字</option>
                    <option value="zh">簡体字</option>
                    <option value="ko">韓国語</option>
                    <option value="pt">ポルトガル語</option>
                    <option value="el">ギリシャ</option>
                    <option value="nl">オランダ語</option>
                    <option value="de">ドイツ語</option>
                    <option value="ru">ロシア語</option>
                    <option value="it">イタリア語</option>
                    <option value="pl">ポーランド語</option>
                    <option value="tr">トルコ語</option>
                </select>
              </Col>
              </Row>
              <Row style={{ marginTop: 5, marginBottom: 5}}>
				        <Col className="d-grid gap-2">     


                <Form.Label style={{ marginTop: 5, marginBottom: 5}}>ターゲット言語を選んでください</Form.Label>
                <br />
                <select onChange={(e) => {
                  this.setState({targetCode: e.target.value});
                  this.setState({targetKanji: e.target.options[e.target.selectedIndex].text})
                }}>
                    <option value="en">英語</option>
                    <option value="fr">フランス語</option>
                    <option value="es">スペイン語</option>
                    <option value="ja">日本語</option>
                    <option value="zh">繁体字</option>
                    <option value="zh">簡体字</option>
                    <option value="ko">韓国語</option>
                    <option value="pt">ポルトガル語</option>
                    <option value="el">ギリシャ</option>
                    <option value="nl">オランダ語</option>
                    <option value="de">ドイツ語</option>
                    <option value="ru">ロシア語</option>
                    <option value="it">イタリア語</option>
                    <option value="pl">ポーランド語</option>
                    <option value="tr">トルコ語</option>
                </select>   
              </Col>
            </Row>

            <Row style={{ marginTop: 5, marginBottom: 5}}>
              <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                <ButtonGroup style={{ marginTop: 10, marginBottom: 10}} aria-label="金岡案件">
                  <Button variant="secondary" onClick={() => {
                      this.setState({BorK: 'shinpuku@hotaru.ltd'})
                    }}
                    >金岡案件</Button>
                  <Button variant="info" onClick={() => {
                      this.setState({BorK: 'nishino@hotaru.ltd'})
                    }}>滋賀案件</Button>
                </ButtonGroup>
              </Col>
            </Row>

            <Row style={{ marginTop: 5, marginBottom: 5}}>
				      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     

                <Button style={{ marginTop: 5, marginBottom: 5}} variant="secondary" type="submit" onClick={this.handleSubmit} >
                  更新を行う
                </Button>
              </Col>
            </Row>
            </Form.Group>
          </Form>
        )}

      </Container>
    );
  }
}






class MergeTmx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      modalTitle: "",
      modalBody: "",

      updateFromTmx: false,
      updateFromCopyPaste: false,
      goOn: false,

      BorK: '',

      pastedSource: "",
      pastedTarget: "",

      file: null,
      baseFile: null,

      fileName: "",
      baseFileName: "",

      segmentArray: [],
      baseSegmentArray: [],

      numberOfUpdates: 0,
      numberOfAdditions: 0,
      
      zuban: "",
      sourceCode: "en",
      targetCode: "en",
      sourceKanji: "英語",
      targetKanji: "英語"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }


  getTmxContents(contents, which) {
     
      var allSegments = []

      var XMLParser = require('react-xml-parser');
      var xml = new XMLParser().parseFromString(contents);    
      var allTuvs = xml.getElementsByTagName('tuv');
      for (var t = 0; t < allTuvs.length; t++) {
        if (allTuvs[t].attributes['xml:lang'].indexOf(this.state.sourceCode) > -1) {
          allSegments.push(allTuvs[t].getElementsByTagName('seg')[0].value)
        } else {
          allSegments.push(allTuvs[t].getElementsByTagName('seg')[0].value)
        }
      }
      if (which === "base") {
        this.setState({baseSegmentArray: allSegments})

      } else {
        this.setState({segmentArray: allSegments})  
      }
      
  }

  async handleFileChosen(file) {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = reject;
      fileReader.readAsText(file);
    });
  }

  readAllFiles = async (AllFiles) => {
    const results = await Promise.all(AllFiles.map(async (file) => {
      const fileContents = await this.handleFileChosen(file);
      return fileContents;
    }));
    
    return results;
  }

  async handleSubmit(event) {
    event.preventDefault();

    var newSegments = [];
    var baseSegments = [];

    if (this.state.updateFromTmx === true) {

      let bothFiles = await this.readAllFiles([this.state.file, this.state.baseFile])
      
      this.getTmxContents(bothFiles[0], "file")
      this.getTmxContents(bothFiles[1], "base")

      newSegments = this.state.segmentArray
      baseSegments = this.state.baseSegmentArray

    } else {

      let baseFile = await this.readAllFiles([this.state.baseFile])

      this.getTmxContents(baseFile[0], "base")

      baseSegments = this.state.baseSegmentArray

      console.log(this.state.pastedSource)
      let pastedSourceArray = this.state.pastedSource.split(/\n/)
      let pastedTargetArray = this.state.pastedTarget.split(/\n/)

      for (var s=0; s<pastedSourceArray.length; s++) {
        newSegments.push(pastedSourceArray[s])
        newSegments.push(pastedTargetArray[s])
      }
      
    }

    for (var n=0; n < newSegments.length; n = n + 2) {

      let updatedUsingThisNewTarget = false;

      // get the source and target segment from the new TMX file
      let thisNewSource = newSegments[n]
      let thisNewTarget = newSegments[n+1]

      // loop through the base file, looking for a source match.
      // If we find a match, replace the target in the base file
      for (var b=0; b < baseSegments.length; b = b + 2) {
        if (baseSegments[b] === thisNewSource) {
          baseSegments[b+1] = thisNewTarget
          updatedUsingThisNewTarget = true;
        }
      }

      // Now the loop is over.  Did we update a segment? Let's check
      // by looking at the updatedUsingThisNewTarget boolean
      if (updatedUsingThisNewTarget === true) {
        let nu = this.state.numberOfUpdates
        nu+=1
        this.setState({numberOfUpdates: nu})
      } else { // If we didn't update a segment, just add this new source and
               // new target to the segments and innards to go into the final tmx file
        baseSegments.push(thisNewSource)
        baseSegments.push(thisNewTarget)

        // Then increase the number of additions by one
        let na = this.state.numberOfAdditions
        na+=1
        this.setState({numberOfAdditions: na})
      }
    }

    this.setState({segmentArray: baseSegments})

    // download the new tmx file
    this.handleDownloadClick()
         
  }

  handleDownloadClick() {

    // put the XML back together
    var finalXml = `<?xml version="1.0" encoding="utf-8"?><tmx version="1.4"><header creationtool="Hotaru_GBChecker" creationtoolversion="6.1" datatype="tmx" segtype="sentence" o-tmf="GlossaryFile" srclang="${this.state.sourceCode}"/><body>`
    let sa = this.state.segmentArray;
    for (var i = 0; i < sa.length; i = i + 2) {
      finalXml = finalXml + `<tu tuid="${i}"><tuv xml:lang="${this.state.sourceCode}"><seg>` + sa[i] + `</seg></tuv><tuv xml:lang="${this.state.targetCode}"><seg>` + sa[i+1] + `</seg></tuv></tu>`
    };
    finalXml = finalXml + `</body></tmx>`
   
    const element = document.createElement("a");
    const file = new Blob([finalXml],    
                {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = this.state.baseFileName;
    document.body.appendChild(element);
    element.click();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        shinki_or_saihonyaku: 'shinki',
        zuban: this.state.zuban,
        source: this.state.sourceKanji,
        target: this.state.targetKanji,
        memory: this.state.baseFileName,
        updates: this.state.numberOfUpdates,
        additions: this.state.numberOfAdditions,
        BorK: this.state.BorK
      })
    };
    console.log(requestOptions.body);
    fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/sendEmailToHotaru', requestOptions)
      .then(response => response.json())
      .then(data => console.log(data));

    this.setState({show: true})
    this.setState({modalTitle: "Complete"})
    this.setState({modalBody: "更新された*.tmx ファイルがダウンロードフォルダに保存されました。その上、「メモリ更新」 がトッドに送信されました。"})
  }

  handleClose() {
		this.setState({show: false})
   
    this.setState({forSearch: ""});
    this.setState({thisTarget: ""});
    if (this.state.modalTitle === "Complete") {
      ReactDOM.render(
        <React.StrictMode>
          <CheckOrEdit />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
	}

  render() {


    console.log(this.state.sourceKanji)
    console.log(this.state.targetKanji)
    console.log(this.state.BorK)

    return (
      <Container>
        <Modal show={this.state.show} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>{this.state.modalTitle}</Modal.Title>
					</Modal.Header>
						<Modal.Body>
							{this.state.modalBody}
						</Modal.Body>
					<Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
						Close
					</Button>
					</Modal.Footer>
				</Modal>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
            <Row style={{ marginTop: 5, marginBottom: 5}}>
              <Col className="d-grid gap-2">    


              <Form.Label style={{ marginTop: 5, marginBottom: 5}}><span style={{ color: 'green', fontWeight: 'bold' }}>更新したい</span>（文章数が多い方）の*.tmx ファイルを選んでください</Form.Label>
                <br />
                <Form.Control 
                  type="file" 
                  onChange={(e) => {
                    this.setState({baseFile: e.target.files[0]});
                    this.setState({baseFileName: e.target.files[0].name})}
                   } />
                </Col>
              </Row>
              <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                  <ButtonGroup style={{ marginTop: 10, marginBottom: 10}} aria-label="*.tmx かコピペ">
                    <Button variant="secondary" onClick={() => {
                        this.setState({updateFromTmx: true})
                        this.setState({goOn: true})
                        this.setState({updateFromCopyPaste: false})
                      }}
                      >*.tmx を使って更新する</Button>
                    <Button variant="info" onClick={() => {
                        this.setState({updateFromCopyPaste: true})
                        this.setState({goOn: true})
                        this.setState({updateFromTmx: false})
                      }}>ブラウザ上に原文訳文コピペで更新する</Button>
                  </ButtonGroup>
                </Col>
              </Row>

              <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                  <ButtonGroup style={{ marginTop: 10, marginBottom: 10}} aria-label="金岡案件">
                    <Button variant="secondary" onClick={() => {
                        this.setState({BorK: 'shinpuku@hotaru.ltd'})
                      }}
                      >金岡案件</Button>
                    <Button variant="info" onClick={() => {
                        this.setState({BorK: 'nishino@hotaru.ltd'})
                      }}>滋賀案件</Button>
                  </ButtonGroup>
                </Col>
              </Row>

            { (this.state.goOn && this.state.updateFromTmx) ? 
              (
                
                <Row style={{ marginTop: 5, marginBottom: 5}}>
                  <Col className="d-grid gap-2">    
                    <Form.Label style={{ marginTop: 5, marginBottom: 5}}>今回の*.tmx ファイルを選んでください</Form.Label>
                    <br />
                    <Form.Control 
                      type="file" 
                      onChange={(e) => {
                        this.setState({file: e.target.files[0]});
                        this.setState({fileName: e.target.files[0].name})}
                      } />
                  </Col>
                </Row>

              ) : (<></>)}

              {(this.state.goOn && this.state.updateFromCopyPaste) ?
                (
                
                <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
                    <Form.Control as="textarea" 
                    rows={3} 
                    columns={200} 
                    onChange={(e) => this.setState({pastedSource: e.target.value})} />
                </Col>
                <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
                    <Form.Control as="textarea" 
                    rows={3} 
                    columns={200} 
                    onChange={(e) => this.setState({pastedTarget: e.target.value})} />
                </Col>
              </Row>
                ):(<></>)
                

              }
              <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col className="d-grid gap-2">    

                <Form.Label style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>図番を選んでください</Form.Label>
                <br />
                <Form.Control type="text" onChange={(e) => this.setState({zuban: e.target.value})} />
                </Col>
              </Row>
              <Row style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>
                <Col className="d-grid gap-2">    

                <Form.Label style={{ marginTop: 5, marginBottom: 5}}>ソース言語を選んでください</Form.Label>
                <br />
                <select onChange={(e) => {
                  this.setState({sourceCode: e.target.value});
                  this.setState({sourceKanji: e.target.options[e.target.selectedIndex].text})
                }}>
                    <option value="en">英語</option>
                    <option value="fr">フランス語</option>
                    <option value="es">スペイン語</option>
                    <option value="ja">日本語</option>
                    <option value="zh">繁体字</option>
                    <option value="zh">簡体字</option>
                    <option value="ko">韓国語</option>
                    <option value="pt">ポルトガル語</option>
                    <option value="el">ギリシャ</option>
                    <option value="nl">オランダ語</option>
                    <option value="de">ドイツ語</option>
                    <option value="ru">ロシア語</option>
                    <option value="it">イタリア語</option>
                    <option value="pl">ポーランド語</option>
                    <option value="tr">トルコ語</option>
                </select>
              </Col>
            </Row>
            <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col className="d-grid gap-2">    


                <Form.Label style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>ターゲット言語を選んでください</Form.Label>
                <br />
                <select onChange={(e) => {
                  this.setState({targetCode: e.target.value});
                  this.setState({targetKanji: e.target.options[e.target.selectedIndex].text})
                }}>
                    <option value="en">英語</option>
                    <option value="fr">フランス語</option>
                    <option value="es">スペイン語</option>
                    <option value="ja">日本語</option>
                    <option value="zh">繁体字</option>
                    <option value="zh">簡体字</option>
                    <option value="ko">韓国語</option>
                    <option value="pt">ポルトガル語</option>
                    <option value="el">ギリシャ</option>
                    <option value="nl">オランダ語</option>
                    <option value="de">ドイツ語</option>
                    <option value="ru">ロシア語</option>
                    <option value="it">イタリア語</option>
                    <option value="pl">ポーランド語</option>
                    <option value="tr">トルコ語</option>
                </select>   
              </Col>
            </Row>
            <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                <Button style={{ marginTop: 5, marginBottom: 5}} variant="secondary" type="submit" onClick={this.handleSubmit} >
                  更新を行う
                </Button>
              </Col>
            </Row>
            </Form.Group>
          </Form>
      </Container>
    );
  }
}



ReactDOM.render(
  <React.StrictMode>
    <CheckOrEdit />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
