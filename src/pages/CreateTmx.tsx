import React from 'react';
import { Button, ButtonGroup, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import CheckOrEdit from './CheckOrEdit';

import MySpinner from '../components/MySpinner';
import PageHeader from '../components/PageHeader';
import ShowPairs from '../components/ShowPairs';

class CreateTmx extends React.Component<{}, 
    {
        show: boolean,
        modalTitle: string,
        modalBody: string,
        showSpinner: boolean,
        showPairs: boolean,
        BorK: string,    
        customerCategory: string,
        BiwakoVariant: string,
        KanaokaVariant: string,
        DaikinGeneralVariant: string,
        LogosVariant: string,
        HyodVariant: string,
        OkKizaiVariant: string,
        HotaruThaiVariant: string,
        ToliVariant: string,
        sourceCode: string,
        targetCode: string,
        sourceKanji: string,
        targetKanji: string,
        category: string,
        segmentArray: any
    }> 
    {
        constructor() {
          super({});
          this.state = {
            show: false,
            modalTitle: "",
            modalBody: "",
      
            showSpinner: false,
      
            showPairs: false,
      
            BorK: '',    
            customerCategory: '',
            BiwakoVariant: 'secondary',
            KanaokaVariant: 'secondary',
            DaikinGeneralVariant: 'secondary',
            LogosVariant: 'secondary',
            HyodVariant: 'secondary',
            OkKizaiVariant: 'secondary',
            HotaruThaiVariant: 'secondary',
            ToliVariant: 'secondary',
      
            sourceCode: "en-us",
            targetCode: "en-us",
            sourceKanji: "英語（北米）",
            targetKanji: "英語（北米）",
            category: "AirPurifier",
            segmentArray: []
          };
          this.handleSubmit = this.handleSubmit.bind(this);
          this.handleShowSubmit = this.handleShowSubmit.bind(this);
          this.handleClose = this.handleClose.bind(this);
        }
      
        async handleSubmit(event: { preventDefault: () => void; }) {
          event.preventDefault();
          this.setState({showSpinner: true})
      
          // get sentences using the getPutSentencesForHotaru endpoint in GCP
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              get_or_put: 'get',
              source: this.state.sourceCode,
              target: this.state.targetCode,
              s_sentence: '',
              t_sentence: '',
              b_or_k: this.state.customerCategory,
              category: this.state.category,
              associated_zuban: ''
            })
          };
          console.log(requestOptions.body);
      
          try {
            const response = await fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/getPutSentencePairForHotaru', requestOptions)
            const json = await response.json();
      
            this.setState({showSpinner: false})
            this.setState({segmentArray: json.contents});
            this.handleDownloadClick()
      
            this.setState({show: true})
            this.setState({modalTitle: "Complete"})
            this.setState({modalBody: "カスタムな*.tmx ファイルがダウンロードフォルダに保存されます。*.sdltm 形式に変換してからトラドスプロジェクトに搭載してください。"})
          } catch (e) {
            this.setState({showSpinner: false})
            this.setState({show: true})
            this.setState({modalTitle:  '文章ペアが存在していない'})
            this.setState({modalBody: "選択しました言語ペア・カテゴリ・工場（滋賀か金岡）の文章が存在していないですので、設定を変えてください。"})
          }
        }
      
        async handleShowSubmit(event: { preventDefault: () => void; }) {
          event.preventDefault();
          this.setState({showSpinner: true})
      
          // get sentences using the getPutSentencesForHotaru endpoint in GCP
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              get_or_put: 'get',
              source: this.state.sourceCode,
              target: this.state.targetCode,
              s_sentence: '',
              t_sentence: '',
              b_or_k: this.state.customerCategory,
              category: this.state.category,
              associated_zuban: ''
            })
          };
          console.log(requestOptions.body)
      
          try {
            const response = await fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/getPutSentencePairForHotaru', requestOptions)
            const json = await response.json();
            this.setState({showSpinner: false})
            this.setState({segmentArray: json.contents});
            this.setState({showPairs: true})
      
          } catch (e) {
            this.setState({showSpinner: false})
            this.setState({show: true})
            this.setState({modalTitle:  '文章ペアが存在していない'})
            this.setState({modalBody: "選択しました言語ペア・カテゴリ・工場（滋賀か金岡）の文章が存在していないですので、設定を変えてください。"})
          }
        }
      
        handleDownloadClick() {
      
          // put the XML back together
          var finalXml = `<?xml version="1.0" encoding="utf-8"?><tmx version="1.4"><header creationtool="Hotaru_GBChecker" creationtoolversion="6.1" datatype="tmx" segtype="sentence" o-tmf="GlossaryFile" srclang="${this.state.sourceCode}"/><body>`
          let sa = this.state.segmentArray;
      
          let tuvIndex = 1;
          for (var i = 0; i < sa.length; i = i + 2) {
            finalXml = finalXml + `<tu tuid="${tuvIndex}"><tuv xml:lang="${this.state.sourceCode}"><seg>` + sa[i] + `</seg></tuv><tuv xml:lang="${this.state.targetCode}"><seg>` + sa[i+1] + `</seg></tuv></tu>`
            tuvIndex += 1;
          };
          finalXml = finalXml + `</body></tmx>`
         
          const element = document.createElement("a");
          const file = new Blob([finalXml],    
                      {type: 'text/plain;charset=utf-8'});
          element.href = URL.createObjectURL(file);
          element.download = this.state.sourceCode + "_to_" + this.state.targetCode + "_" + this.state.category + ".tmx";
          document.body.appendChild(element);
          element.click();
        }
      
      
        handleClose() {
          this.setState({show: false})
         
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
      
          console.log(this.state.showSpinner)
      
          return (
            <Container>
              <PageHeader></PageHeader>
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
                <Form>
                  <Form.Group controlId="formFile" className="mb-3">
      
                    <Row style={{ marginTop: 5, marginBottom: 5}}>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                      <ButtonGroup style={{ marginTop: 10, marginBottom: 10}} aria-label="金岡案件">
                      <Button variant={this.state.BiwakoVariant} onClick={() => {
                            this.setState({BorK: 'shinpuku@hotaru.ltd'})
                            this.setState({customerCategory: 'K'})
                            this.setState({LogosVariant: 'secondary'})
                            this.setState({KanaokaVariant: 'secondary'})
                            this.setState({BiwakoVariant: 'info'})
                            this.setState({DaikinGeneralVariant: 'secondary'})
                            this.setState({HotaruThaiVariant: 'secondary'})
                            this.setState({HyodVariant: 'secondary'})
                            this.setState({OkKizaiVariant: 'secondary'})
                            this.setState({ToliVariant: 'secondary'})
                          }}
                          >金岡案件</Button>
                          <Button variant={this.state.KanaokaVariant} onClick={() => {
                            this.setState({BorK: 'nishino@hotaru.ltd'})
                            this.setState({customerCategory: 'B'})
                            this.setState({LogosVariant: 'secondary'})
                            this.setState({KanaokaVariant: 'info'})
                            this.setState({BiwakoVariant: 'secondary'})
                            this.setState({DaikinGeneralVariant: 'secondary'})
                            this.setState({HotaruThaiVariant: 'secondary'})
                            this.setState({HyodVariant: 'secondary'})
                            this.setState({OkKizaiVariant: 'secondary'})
                            this.setState({ToliVariant: 'secondary'})
                          }}>滋賀案件</Button>
                          <Button variant={this.state.DaikinGeneralVariant} onClick={() => {
                            this.setState({BorK: 'gillies@hotaru.ltd'})
                            this.setState({customerCategory: 'DaikinGeneral'})
                            this.setState({LogosVariant: 'secondary'})
                            this.setState({KanaokaVariant: 'secondary'})
                            this.setState({BiwakoVariant: 'secondary'})
                            this.setState({DaikinGeneralVariant: 'info'})
                            this.setState({HotaruThaiVariant: 'secondary'})
                            this.setState({HyodVariant: 'secondary'})
                            this.setState({OkKizaiVariant: 'secondary'})
                            this.setState({ToliVariant: 'secondary'})
                          }}>ダイキン一般案件</Button>
                          <Button variant={this.state.LogosVariant} onClick={() => {
                            this.setState({BorK: 'kotera@hotaru.ltd'})
                            this.setState({customerCategory: 'L'})
                            this.setState({LogosVariant: 'info'})
                            this.setState({KanaokaVariant: 'secondary'})
                            this.setState({BiwakoVariant: 'secondary'})
                            this.setState({DaikinGeneralVariant: 'secondary'})
                            this.setState({HotaruThaiVariant: 'secondary'})
                            this.setState({HyodVariant: 'secondary'})
                            this.setState({OkKizaiVariant: 'secondary'})
                            this.setState({ToliVariant: 'secondary'})
                          }}>ロゴス案件</Button>
                          <Button variant={this.state.HotaruThaiVariant} onClick={() => {
                            this.setState({BorK: 'tanaka@hotaru.ltd'})
                            this.setState({customerCategory: 'HotaruThai'})
                            this.setState({LogosVariant: 'secondary'})
                            this.setState({KanaokaVariant: 'secondary'})
                            this.setState({BiwakoVariant: 'secondary'})
                            this.setState({DaikinGeneralVariant: 'secondary'})
                            this.setState({HotaruThaiVariant: 'info'})
                            this.setState({HyodVariant: 'secondary'})
                            this.setState({OkKizaiVariant: 'secondary'})
                            this.setState({ToliVariant: 'secondary'})
                          }}>ホタルタイ案件</Button>
                          <Button variant={this.state.HyodVariant} onClick={() => {
                            this.setState({BorK: 'kotera@hotaru.ltd'})
                            this.setState({customerCategory: 'Hyod'})
                            this.setState({LogosVariant: 'secondary'})
                            this.setState({KanaokaVariant: 'secondary'})
                            this.setState({BiwakoVariant: 'secondary'})
                            this.setState({DaikinGeneralVariant: 'secondary'})
                            this.setState({HotaruThaiVariant: 'secondary'})
                            this.setState({HyodVariant: 'info'})
                            this.setState({OkKizaiVariant: 'secondary'})
                            this.setState({ToliVariant: 'secondary'})
                          }}>HYOD 案件</Button>
                          <Button variant={this.state.OkKizaiVariant} onClick={() => {
                            this.setState({BorK: 'shinpuku@hotaru.ltd'})
                            this.setState({customerCategory: 'OkKizai'})
                            this.setState({LogosVariant: 'secondary'})
                            this.setState({KanaokaVariant: 'secondary'})
                            this.setState({BiwakoVariant: 'secondary'})
                            this.setState({DaikinGeneralVariant: 'secondary'})
                            this.setState({HotaruThaiVariant: 'secondary'})
                            this.setState({HyodVariant: 'secondary'})
                            this.setState({OkKizaiVariant: 'info'})
                            this.setState({ToliVariant: 'secondary'})
                          }}>オーケー器材案件</Button>
                          <Button variant={this.state.ToliVariant} onClick={() => {
                            this.setState({BorK: 'kotera@hotaru.ltd'})
                            this.setState({customerCategory: 'Toli'})
                            this.setState({LogosVariant: 'secondary'})
                            this.setState({KanaokaVariant: 'secondary'})
                            this.setState({BiwakoVariant: 'secondary'})
                            this.setState({DaikinGeneralVariant: 'secondary'})
                            this.setState({HotaruThaiVariant: 'secondary'})
                            this.setState({HyodVariant: 'secondary'})
                            this.setState({OkKizaiVariant: 'secondary'})
                            this.setState({ToliVariant: 'info'})
                          }}>東リ案件</Button>
                      </ButtonGroup>
                      </Col>
                    </Row>
      
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
                          <option value="LogosCatalog">ロゴスのカタログ</option>
                          <option value="ToliCatalog">東リのカタログ</option>
                          <option value="InfoPlate">銘版</option>
                          <option value="AirBoost">エア・ブースト（HYOD)</option>
                          <option value="Accessories">別売品</option>
                      </select>   
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
                          <option value="fr-ca">フランス語(カナダ)</option>
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
                          <option value="ar-ar">アラビア語</option>
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
                          <option value="fr-ca">フランス語(カナダ)</option>
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
                          <option value="ar-ar">アラビア語</option>
                      </select>   
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 5, marginBottom: 5}}>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                      <Button style={{ marginTop: 5, marginBottom: 5}} variant="secondary" type="submit" onClick={this.handleSubmit} >
                        *.tmx ファイルをダウンロード
                      </Button>
                    </Col>
                  </Row>
                  {(this.state.showPairs) ?
                      (
                        <ShowPairs pairs={this.state.segmentArray}/>
                      ) : (
                      <Row style={{ marginTop: 5, marginBottom: 5}}>
                          <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                          <Button style={{ marginTop: 5, marginBottom: 5}} variant="info" type="submit" onClick={this.handleShowSubmit} >
                            ブラウザーで表示します
                          </Button>
                        </Col>
                      </Row>
                      )}
                  </Form.Group>
                </Form>
            </Container>
          );
        }
      }
      
export default CreateTmx;