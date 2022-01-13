import React from 'react'
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';

import PageHeader from '../components/PageHeader';
import MySpinner from '../components/MySpinner';

import CheckOrEdit from '../pages/CheckOrEdit';

class UpdateTmx extends React.Component<
{}, {
    show: boolean,
    modalTitle: string,
    modalBody: string,
    showSpinner: boolean,
    forSearch: string,
    thisTarget: string,
    segmentArray: any[],
    segmentArrayForBackendUpdate: any[],
    numberOfUpdates: any,
    showSearchArea: boolean,
    zuban: string,
    sourceCode: string,
    targetCode: string,
    category: string,
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
    sourceKanji: string,
    targetKanji: string
}> {
    constructor() {
        super({});
        this.state = {
          show: false,
          modalTitle: "",
          modalBody: "",
    
          showSpinner: false,
     
          forSearch: "",
          thisTarget: "",
          segmentArray: [],
    
          segmentArrayForBackendUpdate: [],
    
          numberOfUpdates: 0,
          showSearchArea: false,
          zuban: "",
          sourceCode: "en-us",
          targetCode: "en-us",
          category: "AirPurifier",
    
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
          
          sourceKanji: "英語（北米）",
          targetKanji: "英語（北米）"
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearchClick = this.handleSearchClick.bind(this);
        this.handleUpdateClick = this.handleUpdateClick.bind(this);
        this.handleFinishClick = this.handleFinishClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
      }
    
      handleSearchClick() {
        if (this.state.segmentArray.indexOf(this.state.forSearch) > -1) {
          let foundIt = this.state.segmentArray[this.state.segmentArray.indexOf(this.state.forSearch)+1]
          this.setState({thisTarget: foundIt})
        }
      }
    
      handleUpdateClick() {
        let safbu = this.state.segmentArrayForBackendUpdate;
        safbu.push(this.state.forSearch)
        safbu.push(this.state.thisTarget)
        this.setState({segmentArrayForBackendUpdate: safbu});
    
        this.setState({modalTitle: "更新された"})
        this.setState({modalBody: "このセグメントペアが更新されました"})
        let nu = this.state.numberOfUpdates;
        nu+=1
        this.setState({numberOfUpdates: nu})
        this.setState({show: true})
      }
    
      async handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        this.setState({showSpinner: true});
    
        // get all sentences using the getPutSentencesForHotaru endpoint in GCP
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
          this.setState({segmentArray: json.contents});
          this.setState({showSearchArea: true})
          this.setState({showSpinner: false})
        } catch (e) {
          this.setState({show: true})
          this.setState({modalTitle:  '文章ペアが存在していない'})
          this.setState({modalBody: "選択しました言語ペア・カテゴリ・工場（滋賀か金岡）の文章が存在していないですので、設定を変えてください。"})
          this.setState({showSpinner: false})
        }
        
      }
    
      async handleFinishClick() {
    
        // send a POST request to the backend, triggering an email to everyone about
        // the update
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shinki_or_saihonyaku: 'saihonyaku',
            zuban: this.state.zuban,
            source: this.state.sourceKanji,
            target: this.state.targetKanji,
            updates: this.state.numberOfUpdates,
            additions: '0',
            BorK: this.state.BorK
          })
        };
        fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/sendEmailToHotaru', requestOptions)
          .then(response => response.json())
          .then(data => console.log(data));
    
        // Then, update the actual segments by sending them to the backend
    
        let ssegs = []
        let tsegs = []
        let safbu = this.state.segmentArrayForBackendUpdate;
        for (var s = 0; s < safbu.length; s = s + 2) {
          ssegs.push(safbu[s])
          tsegs.push(safbu[s+1])
        }
    
        const requestOptionsPut = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            get_or_put: 'put',
            source: this.state.sourceCode,
            target: this.state.targetCode,
            s_sentence: ssegs,
            t_sentence: tsegs,
            b_or_k: this.state.customerCategory,
            category: this.state.category,
            associated_zuban: ''
          })
        };
        console.log(requestOptionsPut.body);
        fetch('https://us-central1-hotaru-kanri.cloudfunctions.net/getPutSentencePairForHotaru', requestOptionsPut)
        
    
        this.setState({show: true})
        this.setState({modalTitle: "Complete"})
        this.setState({modalBody: "更新した原文・訳文ペアがデータベースに保存されました。その上、「メモリ更新」 がトッドに送信されました。"})
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
            { this.state.showSearchArea ? 
             (
            <Container>
              <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
                    修正しています
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
                  
                  onChange={(e) => this.setState({forSearch: e.target.value})} />
              </Col>
              <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
                  <Form.Control as="textarea" value={this.state.thisTarget} rows={3}  onChange={(e) => this.setState({thisTarget: e.target.value})} />
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
                <Button variant="success" size="lg" onClick={this.handleFinishClick}>更新が完了</Button>
              </Col>
            </Row>
            </Container>
            ) : (
              
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
                        <option value="LogosCatalog">ロゴスのカタログ</option>
                        <option value="ToliCatalog">東リのカタログ</option>
                        <option value="InfoPlate">銘版</option>
                        <option value="AirBoost">エア・ブースト（HYOD)</option>
                        <option value="Accessories">別売品</option>
                    </select>   
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
    
    
                    <Form.Label style={{ marginTop: 5, marginBottom: 5}}>ターゲット言語を選んでください</Form.Label>
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
                    <ButtonGroup style={{ marginTop: 10, marginBottom: 10}}>
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
    

export default UpdateTmx;