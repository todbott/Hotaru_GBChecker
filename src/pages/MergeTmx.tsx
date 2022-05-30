import React from 'react'
import ReactDOM from 'react-dom'
import { Button, ButtonGroup, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import MySpinner from '../components/MySpinner';
import PageHeader from '../components/PageHeader';
import CheckOrEdit from './CheckOrEdit';
import GetPairsFromBackend from '../services/GetPairsFromBackend';
import SendPairsToBackend from '../services/SendPairsToBackend';
import SendUpdateEmail from '../services/SendUpdateEmail';
import CustomerPicker from './CustomerPicker';

class MergeTmx extends React.Component<{},
{
    show: boolean,
    modalTitle: string,
    modalBody: string,
    showConfirmationModal: boolean,
    showSpinner: boolean,
    updateFromTmx: boolean,
    updateFromCopyPaste: boolean,
    goOn: boolean,
    BorK: string,
    customerCategory: string,
    TmxVariant: string,
    CopyPasteVariant: string,
    category: string,
    pastedSource: string,
    pastedTarget: string,
    pastedSourceLength: any,
    pastedTargetLength: any,
    file: any,
    fileName: string,
    segmentArray: any[],
    baseSegmentArray: any[],
    segmentArrayForBackendUpdate: any[],
    numberOfUpdates: any,
    numberOfAdditions: any,
    zuban: string,
    sourceCode: string,
    targetCode: string,
    sourceKanji: string,
    targetKanji: string
}> {
   
        constructor() {
          super({});
          this.state = {
            show: false,
            modalTitle: "",
            modalBody: "",

            showConfirmationModal: false,
      
            showSpinner: false,
      
            updateFromTmx: false,
            updateFromCopyPaste: false,
            goOn: false,
      
            BorK: '',
            customerCategory: '',
      
            TmxVariant: 'secondary',
            CopyPasteVariant: 'secondary',
      
            category: 'AirPurifier',
      
            pastedSource: "",
            pastedTarget: "",
      
            pastedSourceLength: 0,
            pastedTargetLength: 0,
      
            file: null,
            fileName: "",
      
      
            segmentArray: [],
            baseSegmentArray: [],
      
            segmentArrayForBackendUpdate: [],
      
            numberOfUpdates: 0,
            numberOfAdditions: 0,
            
            zuban: "",
            sourceCode: "en-us",
            targetCode: "en-us",
            sourceKanji: "英語（北米）",
            targetKanji: "英語（北米）"
          };
          this.handleSubmit = this.handleSubmit.bind(this);
          this.handleClose = this.handleClose.bind(this);
          this.handleContinue = this.handleContinue.bind(this);
        }

        onChangeValueHandler = (val: any[] ) => {
          console.log(val)
          this.setState({ BorK: val[0] })
          this.setState({ customerCategory: val[1]})
        }
      
      
        getTmxContents(contents: any) {
           
            var allSegments = []
      
            var XMLParser = require('react-xml-parser');
            var xml = new XMLParser().parseFromString(contents);    
            var allTuvs = xml.getElementsByTagName('tuv');
            for (var t = 0; t < allTuvs.length; t++) {
              if (allTuvs[t].attributes['xml:lang'].indexOf(this.state.sourceCode.split("-")[0]) > -1) {
                allSegments.push(allTuvs[t].getElementsByTagName('seg')[0].value)
              } else {
                allSegments.push(allTuvs[t].getElementsByTagName('seg')[0].value)
              }
            }
            
            this.setState({segmentArray: allSegments})  
        }
      
        async handleFileChosen(file: Blob) {
          return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.onload = () => {
              resolve(fileReader.result);
            };
            fileReader.onerror = reject;
            fileReader.readAsText(file);
          });
        }
      
        readAllFiles = async (AllFiles: any[]) => {
          const results = await Promise.all(AllFiles.map(async (file) => {
            const fileContents = await this.handleFileChosen(file);
            return fileContents;
          }));
          
          return results;
        }
      
        async getPairsFromBackend() {
          
          let maybePairs = await GetPairsFromBackend(this.state.sourceCode, this.state.targetCode, this.state.customerCategory, this.state.category)
          if (maybePairs !== "no pairs") {
            this.setState({baseSegmentArray: maybePairs.contents})
            this.setState({showSpinner: false})
            return maybePairs.contents
          } else {
            this.setState({showSpinner: false})
            this.setState({show: true})
            this.setState({modalTitle:  '文章ペアが存在していない'})
            this.setState({modalBody: "選択しました言語ペア・カテゴリ・工場（滋賀か金岡）の文章が存在していないですので、設定を変えてください。"})
          }
        }
      
        async handleSubmit(event: { preventDefault: () => void; }) {
          event.preventDefault();
      
          //If the number of lines in the source and target copy-paste boxes
          //are not the same, send an alert
          if (this.state.pastedSourceLength !== this.state.pastedTargetLength) {
            this.setState({show: true})
            this.setState({modalTitle: "行数が違います"})
            this.setState({modalBody:  `ソースに　${this.state.pastedSourceLength}行　があり、ターゲットに　${this.state.pastedTargetLength}行　があります。行数が違うであれば、データベースの書き込みが出来なくなります。`
          })
          
          } else { 
      
            var newSegments = [];
            var baseSegments = [];
      
            if (this.state.updateFromTmx === true) {
      
              let bothFiles = await this.readAllFiles([this.state.file])
              
              this.getTmxContents(bothFiles[0])
      
              newSegments = this.state.segmentArray
              baseSegments = await this.getPairsFromBackend();
      
            } else {
      
              baseSegments = await this.getPairsFromBackend();
      
              console.log(this.state.pastedSource)
              let pastedSourceArray = this.state.pastedSource.split(/\n/)
              let pastedTargetArray = this.state.pastedTarget.split(/\n/)
      
              for (var s=0; s<pastedSourceArray.length; s++) {
                newSegments.push(pastedSourceArray[s])
                newSegments.push(pastedTargetArray[s])
              }
              
            }
      
            // There's a possibility that we couldn't get the baseSegments from the backend
            // (probably because the langauge pair/category/factory didn't exist)
            // so we'll have to skip the whole thing if baseSegments is empty
            if (baseSegments) {
      
              let safbu = this.state.segmentArrayForBackendUpdate;
      
              for (var n=0; n < newSegments.length; n = n + 2) {
      
                let updatedUsingThisNewTarget = false;
                let skipThisOne = false;
      
                // get the source and target segment from the new TMX file
                let thisNewSource = newSegments[n]
                let thisNewTarget = newSegments[n+1]
      
                // loop through the base file, looking for a source match.
                // If we find a match where the source is the same but the target is different, 
                // replace the target in the base file
                for (var b=0; b < baseSegments.length; b = b + 2) {
                  if ((baseSegments[b] === thisNewSource) && (baseSegments[b+1] !== thisNewTarget)) {
                    baseSegments[b+1] = thisNewTarget
                    updatedUsingThisNewTarget = true;
                    safbu.push(baseSegments[b])
                    safbu.push(thisNewTarget)
                  } 
                  if ((baseSegments[b] === thisNewSource) && (baseSegments[b+1] === thisNewTarget)) {
                    skipThisOne = true;
                  }
                }
      
                if (skipThisOne === false) {
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
      
                    safbu.push(thisNewSource)
                    safbu.push(thisNewTarget)
      
                    // Then increase the number of additions by one
                    let na = this.state.numberOfAdditions
                    na+=1
                    this.setState({numberOfAdditions: na})
                  }
                }
              }
      
              this.setState({segmentArray: baseSegments})
              this.setState({segmentArrayForBackendUpdate: safbu})
              console.log(safbu.length);
      
              // confirm with the user, then
              // send an email to the people, then
              // perform merging of the new segments/changed segments in the database
              this.setState({showConfirmationModal: true})
            }
          }
        }
      
        handleContinue() {

      
          SendUpdateEmail('shinki', this.state.zuban, this.state.sourceKanji, this.state.targetKanji, this.state.numberOfUpdates, this.state.numberOfAdditions, this.state.BorK)
      
          // Then, update the actual segments by sending them to the backend
          // Due to Google Cloud Function Timeouts (9 minutes max), it seems like only about 500
          // sentence pairs can be added to the database at one time.
          // Therefore, I'll send all the segments in the segmentArrayForBackendUpdate
          // to the API endpoint in little 1000-sentence chunks (500 source and 500 target)
          let safbu = this.state.segmentArrayForBackendUpdate;
      
          let theseSsegs = []
          let theseTsegs = []
          let ssegs = []
          let tsegs = []
          let fhCounter = 0; // five hundred counter
          for (var s = 0; s < safbu.length; s = s + 2) {
            theseSsegs.push(safbu[s])
            theseTsegs.push(safbu[s+1])
            fhCounter += 1;
            if (fhCounter > 500) {
              fhCounter = 0;
              ssegs.push(theseSsegs)
              tsegs.push(theseTsegs)
              theseSsegs = []
              theseTsegs = []
            }
          }
      
          ssegs.push(theseSsegs)
          tsegs.push(theseTsegs)
      
          console.log(ssegs)
          console.log(tsegs)
          
      
          for (var r = 0; r < ssegs.length; r++) {
            SendPairsToBackend(this.state.sourceCode, this.state.targetCode, ssegs[r], tsegs[r], this.state.customerCategory, this.state.category, this.state.zuban)
          }
          this.setState({show: true})
          this.setState({modalTitle: "Complete"})
          this.setState({modalBody: "更新した原文・訳文ペアがデータベースに保存されました。その上、「メモリ更新」 がトッドに送信されました。"})
        
        }
      
        handleClose() {
            this.setState({show: false})
            this.setState({showConfirmationModal: false})
          
            ReactDOM.render(
              <React.StrictMode>
                <CheckOrEdit />
              </React.StrictMode>,
              document.getElementById('root')
            );
          
          }
      
        render() {

          console.log(this.state.sourceKanji)
      
          return (
            <Container>
              <PageHeader modoru={true}></PageHeader>
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
              { this.state.showSpinner ? 
               (
                 <MySpinner />
               ) : (<></>)
              }
              { this.state.showConfirmationModal ? 
               (
                
                  <Modal show="true" style={{ content: {borderRadius: '10px'}}}>
                  <Modal.Body>
                    <Container>
                      <Row style={{fontWeight: 'bolder'}}>
                        <Col>
                          下記の詳細を確認してくから進んでください。
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          {this.state.sourceKanji} ⇒ {this.state.targetKanji}
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          {this.state.numberOfUpdates} が更新になり、{this.state.numberOfAdditions}が追加になります。
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          {this.state.customerCategory} の {this.state.category}
                        </Col>
                      </Row>
                    </Container>
                  </Modal.Body>
                  <Modal.Footer>
                      <Button variant="success" onClick={this.handleContinue}>
                          Continue
                      </Button>
                      <Button variant="danger" onClick={this.handleClose}>
                          Cancel
                      </Button>
                  </Modal.Footer>
                </Modal>
                
               ) : (<></>)
              }
                <Form>
                  <Form.Group controlId="formFile" className="mb-3">
                  <Row style={{ marginTop: 5, marginBottom: 5}}>
                      <Col className="d-grid gap-2">    
      
                      <Form.Label style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>カテゴリ選んでください</Form.Label>
                      <br />
                      <select onChange={(e) => {
                        this.setState({category: e.target.value});
                      }}>
                          <option value="AirPurifier">空気清浄機</option>
                          <option value="AirConditionerInstallation">エアコン（据説）</option>
                          <option value="VrvInstallation">VRV（据説）</option>
                          <option value="AirConditionerOperation">エアコン（取説）</option>
                          <option value="DgpfEdge">DGPFエッジ</option>
                          <option value="OilCon">オイルコン</option>
                          <option value="Chiller">チラー</option>
                          <option value="WaterHeater">給湯器</option>
                          <option value="DecorationPanel">デコレーションパネル</option>
                          <option value="WiredRemoteController">有線リモコン</option>
                          <option value="WirelessAdapter">無線アダプター</option>
                          <option value="SpecManual">仕様書</option>
                          <option value="InfoPlate">銘版</option>
                          <option value="SmartphoneApp">アプリ</option>
                          {/* <option value="LogosCatalog">ロゴスのカタログ</option>
                          <option value="ToliCatalog">東リのカタログ</option>
                          <option value="InfoPlate">銘版</option>
                          <option value="AirBoost">エア・ブースト（HYOD)</option>
                          <option value="Accessories">別売品</option>
                          <option value="FlarelessJoint">フレアレスジョイント</option> */}
                      </select>   
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 5, marginBottom: 5}}>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                        <ButtonGroup style={{ marginTop: 10, marginBottom: 10}} aria-label="*.tmx かコピペ">
                          <Button variant={this.state.TmxVariant} onClick={() => {
                              this.setState({updateFromTmx: true})
                              this.setState({goOn: true})
                              this.setState({updateFromCopyPaste: false})
                              this.setState({TmxVariant: 'info'})
                              this.setState({CopyPasteVariant: 'secondary'})
                            }}
                            >*.tmx を使って更新する</Button>
                          <Button variant={this.state.CopyPasteVariant} onClick={() => {
                              this.setState({updateFromCopyPaste: true})
                              this.setState({goOn: true})
                              this.setState({updateFromTmx: false})
                              this.setState({TmxVariant: 'secondary'})
                              this.setState({CopyPasteVariant: 'info'})
                            }}>ブラウザ上に原文訳文コピペで更新する</Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
      
                    <CustomerPicker onChangeValue={this.onChangeValueHandler} />
      
                  { (this.state.goOn && this.state.updateFromTmx) ? 
                    (
                      
                      <Row style={{ marginTop: 5, marginBottom: 5}}>
                        <Col className="d-grid gap-2">    
                          <Form.Label style={{ marginTop: 5, marginBottom: 5}}>今回の*.tmx ファイルを選んでください</Form.Label>
                          <br />
                          <Form.Control 
                            type="file" 
                            onChange={(e) => {
                              this.setState({file: (e.target as HTMLInputElement).files![0]});
                              this.setState({fileName: (e.target as HTMLInputElement).files![0].name})}
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
                          
                          onChange={(e) => {
                            this.setState({pastedSource: e.target.value});
                            this.setState({pastedSourceLength: e.target.value.split(/\n/).length});
                          }} />
                      </Col>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
                          <Form.Control as="textarea" 
                          rows={3} 
                          
                          onChange={(e) => {
                            this.setState({pastedTarget: e.target.value});
                            this.setState({pastedTargetLength: e.target.value.split(/\n/).length});
                          }} />
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
                          <option value="en-us">英語(北米)</option>
                          <option value="en-uk">英語(UK)</option>
                          <option value="ja-jp">日本語</option>
                          {/* <option value="fr-ca">フランス語(カナダ)</option>
                          <option value="es-mx">スペイン語(メキシコ)</option>
                          <option value="ja-jp">日本語</option>
                          <option value="zh-tw">繁体字</option>
                          <option value="zh-cn">簡体字</option>
                          <option value="ko-ko">韓国語</option>
                          <option value="id-id">インドネシア語</option>
                          <option value="vi-vn">ベトナム語</option>
                          <option value="th-th">タイ語</option>
                          <option value="tl-x-SDL">タガログ語</option>
                          <option value="ms-sg">マレイ語</option>
                          <option value="fr-fr">フランス語(ヨーロッパ)</option>
                          <option value="es-es">スペイン語(ヨーロッパ)</option>
                          <option value="sv-se">スウェーデン語</option>
                          <option value="nb-no">ノルウェー語</option>
                          <option value="pt-pt">ポルトガル語(ポルトガル)</option>
                          <option value="pt-br">ポルトガル語(ブラジル)</option>
                          <option value="el-el">ギリシャ</option>
                          <option value="nl-nl">オランダ語</option>
                          <option value="de-de">ドイツ語</option>
                          <option value="ru-ru">ロシア語</option>
                          <option value="it-it">イタリア語</option>
                          <option value="pl-pl">ポーランド語</option>
                          <option value="tr-tr">トルコ語</option>
                          <option value="ar-ar">アラビア語</option> */}
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
                          <option value="en-us">英語(北米)</option>
                          <option value="en-uk">英語(UK)</option>
                          <option value="ja-jp">日本語</option>
                          {/* <option value="fr-ca">フランス語(カナダ)</option>
                          <option value="es-mx">スペイン語(メキシコ)</option>
                          <option value="ja-jp">日本語</option>
                          <option value="zh-tw">繁体字</option>
                          <option value="zh-cn">簡体字</option>
                          <option value="ko-ko">韓国語</option>
                          <option value="id-id">インドネシア語</option>
                          <option value="vi-vn">ベトナム語</option>
                          <option value="th-th">タイ語</option>
                          <option value="tl-x-SDL">タガログ語</option>
                          <option value="ms-sg">マレイ語</option>
                          <option value="fr-fr">フランス語(ヨーロッパ)</option>
                          <option value="es-es">スペイン語(ヨーロッパ)</option>
                          <option value="sv-se">スウェーデン語</option>
                          <option value="nb-no">ノルウェー語</option>
                          <option value="pt-pt">ポルトガル語(ポルトガル)</option>
                          <option value="pt-br">ポルトガル語(ブラジル)</option>
                          <option value="el-el">ギリシャ</option>
                          <option value="nl-nl">オランダ語</option>
                          <option value="de-de">ドイツ語</option>
                          <option value="ru-ru">ロシア語</option>
                          <option value="it-it">イタリア語</option>
                          <option value="pl-pl">ポーランド語</option>
                          <option value="tr-tr">トルコ語</option>
                          <option value="ar-ar">アラビア語</option> */}
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
export default MergeTmx;