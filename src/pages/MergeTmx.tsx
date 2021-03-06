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
            sourceKanji: "??????????????????",
            targetKanji: "??????????????????"
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
            this.setState({modalTitle:  '????????????????????????????????????'})
            this.setState({modalBody: "????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"})
          }
        }
      
        async handleSubmit(event: { preventDefault: () => void; }) {
          event.preventDefault();
      
          //If the number of lines in the source and target copy-paste boxes
          //are not the same, send an alert
          if (this.state.pastedSourceLength !== this.state.pastedTargetLength) {
            this.setState({show: true})
            this.setState({modalTitle: "?????????????????????"})
            this.setState({modalBody:  `???????????????${this.state.pastedSourceLength}???????????????????????????????????????${this.state.pastedTargetLength}?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`
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
          this.setState({modalBody: "?????????????????????????????????????????????????????????????????????????????????????????????????????????????????? ???????????????????????????????????????"})
        
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
                          ???????????????????????????????????????????????????????????????
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          {this.state.sourceKanji} ??? {this.state.targetKanji}
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          {this.state.numberOfUpdates} ?????????????????????{this.state.numberOfAdditions}???????????????????????????
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          {this.state.customerCategory} ??? {this.state.category}
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
      
                      <Form.Label style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>?????????????????????????????????</Form.Label>
                      <br />
                      <select onChange={(e) => {
                        this.setState({category: e.target.value});
                      }}>
                          <option value="AirPurifier">???????????????</option>
                          <option value="AirConditionerInstallation">????????????????????????</option>
                          <option value="VrvInstallation">VRV????????????</option>
                          <option value="AirConditionerOperation">????????????????????????</option>
                          <option value="DgpfEdge">DGPF?????????</option>
                          <option value="OilCon">???????????????</option>
                          <option value="Chiller">?????????</option>
                          <option value="WaterHeater">?????????</option>
                          <option value="DecorationPanel">??????????????????????????????</option>
                          <option value="WiredRemoteController">??????????????????</option>
                          <option value="WirelessAdapter">?????????????????????</option>
                          <option value="SpecManual">?????????</option>
                          <option value="InfoPlate">??????</option>
                          <option value="SmartphoneApp">?????????</option>
                          {/* <option value="LogosCatalog">????????????????????????</option>
                          <option value="ToliCatalog">?????????????????????</option>
                          <option value="InfoPlate">??????</option>
                          <option value="AirBoost">????????????????????????HYOD)</option>
                          <option value="Accessories">?????????</option>
                          <option value="FlarelessJoint">??????????????????????????????</option> */}
                      </select>   
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 5, marginBottom: 5}}>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                        <ButtonGroup style={{ marginTop: 10, marginBottom: 10}} aria-label="*.tmx ????????????">
                          <Button variant={this.state.TmxVariant} onClick={() => {
                              this.setState({updateFromTmx: true})
                              this.setState({goOn: true})
                              this.setState({updateFromCopyPaste: false})
                              this.setState({TmxVariant: 'info'})
                              this.setState({CopyPasteVariant: 'secondary'})
                            }}
                            >*.tmx ????????????????????????</Button>
                          <Button variant={this.state.CopyPasteVariant} onClick={() => {
                              this.setState({updateFromCopyPaste: true})
                              this.setState({goOn: true})
                              this.setState({updateFromTmx: false})
                              this.setState({TmxVariant: 'secondary'})
                              this.setState({CopyPasteVariant: 'info'})
                            }}>??????????????????????????????????????????????????????</Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
      
                    <CustomerPicker onChangeValue={this.onChangeValueHandler} />
      
                  { (this.state.goOn && this.state.updateFromTmx) ? 
                    (
                      
                      <Row style={{ marginTop: 5, marginBottom: 5}}>
                        <Col className="d-grid gap-2">    
                          <Form.Label style={{ marginTop: 5, marginBottom: 5}}>?????????*.tmx ????????????????????????????????????</Form.Label>
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
      
                      <Form.Label style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>??????????????????????????????</Form.Label>
                      <br />
                      <Form.Control type="text" onChange={(e) => this.setState({zuban: e.target.value})} />
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>
                      <Col className="d-grid gap-2">    
      
                      <Form.Label style={{ marginTop: 5, marginBottom: 5}}>???????????????????????????????????????</Form.Label>
                      <br />
                      <select onChange={(e) => {
                        this.setState({sourceCode: e.target.value});
                        this.setState({sourceKanji: e.target.options[e.target.selectedIndex].text})
                      }}>
                          <option value="en-us">??????(??????)</option>
                          <option value="en-uk">??????(UK)</option>
                          <option value="ja-jp">?????????</option>
                          {/* <option value="fr-ca">???????????????(?????????)</option>
                          <option value="es-mx">???????????????(????????????)</option>
                          <option value="ja-jp">?????????</option>
                          <option value="zh-tw">?????????</option>
                          <option value="zh-cn">?????????</option>
                          <option value="ko-ko">?????????</option>
                          <option value="id-id">?????????????????????</option>
                          <option value="vi-vn">???????????????</option>
                          <option value="th-th">?????????</option>
                          <option value="tl-x-SDL">???????????????</option>
                          <option value="ms-sg">????????????</option>
                          <option value="fr-fr">???????????????(???????????????)</option>
                          <option value="es-es">???????????????(???????????????)</option>
                          <option value="sv-se">?????????????????????</option>
                          <option value="nb-no">??????????????????</option>
                          <option value="pt-pt">??????????????????(???????????????)</option>
                          <option value="pt-br">??????????????????(????????????)</option>
                          <option value="el-el">????????????</option>
                          <option value="nl-nl">???????????????</option>
                          <option value="de-de">????????????</option>
                          <option value="ru-ru">????????????</option>
                          <option value="it-it">???????????????</option>
                          <option value="pl-pl">??????????????????</option>
                          <option value="tr-tr">????????????</option>
                          <option value="ar-ar">???????????????</option> */}
                      </select>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 5, marginBottom: 5}}>
                      <Col className="d-grid gap-2">    
      
      
                      <Form.Label style={{ marginTop: 5, marginBottom: 5, marginRight: 5}}>?????????????????????????????????????????????</Form.Label>
                      <br />
                      <select onChange={(e) => {
                        this.setState({targetCode: e.target.value});
                        this.setState({targetKanji: e.target.options[e.target.selectedIndex].text})
                      }}>
                          <option value="en-us">??????(??????)</option>
                          <option value="en-uk">??????(UK)</option>
                          <option value="ja-jp">?????????</option>
                          {/* <option value="fr-ca">???????????????(?????????)</option>
                          <option value="es-mx">???????????????(????????????)</option>
                          <option value="ja-jp">?????????</option>
                          <option value="zh-tw">?????????</option>
                          <option value="zh-cn">?????????</option>
                          <option value="ko-ko">?????????</option>
                          <option value="id-id">?????????????????????</option>
                          <option value="vi-vn">???????????????</option>
                          <option value="th-th">?????????</option>
                          <option value="tl-x-SDL">???????????????</option>
                          <option value="ms-sg">????????????</option>
                          <option value="fr-fr">???????????????(???????????????)</option>
                          <option value="es-es">???????????????(???????????????)</option>
                          <option value="sv-se">?????????????????????</option>
                          <option value="nb-no">??????????????????</option>
                          <option value="pt-pt">??????????????????(???????????????)</option>
                          <option value="pt-br">??????????????????(????????????)</option>
                          <option value="el-el">????????????</option>
                          <option value="nl-nl">???????????????</option>
                          <option value="de-de">????????????</option>
                          <option value="ru-ru">????????????</option>
                          <option value="it-it">???????????????</option>
                          <option value="pl-pl">??????????????????</option>
                          <option value="tr-tr">????????????</option>
                          <option value="ar-ar">???????????????</option> */}
                      </select>   
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 5, marginBottom: 5}}>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
                      <Button style={{ marginTop: 5, marginBottom: 5}} variant="secondary" type="submit" onClick={this.handleSubmit} >
                        ???????????????
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