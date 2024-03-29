import React from 'react'
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Slider from '@material-ui/core/Slider'
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import PageHeader from '../components/PageHeader';
import MySpinner from '../components/MySpinner';

import CheckOrEdit from '../pages/CheckOrEdit';

class ShowTmx extends React.Component<
// props
{
    TmxContents: any[][], 
    apiKey: string, 
    fromWhere: any, 
    sourceCode: string, 
    targetCode: string
},
// state
{
    TmxContents: any[][],
    whichPair: any,
    source: string,
    toTranslate: string,
    translated: string,
    problemSegments: any[],
    allSegments: any[],
    comment: string,
    show: boolean,
    cutoff: any,
    leftSideRightSide: string,
    middle: string,
}> {
    nextRef: any;
    userLanguage: string;
    API_KEY: string;
    URL: string;
    constructor(props: {
            TmxContents: any[][]; 
            apiKey: string; 
            fromWhere: any; 
            sourceCode: string; 
            targetCode: string;
        } | Readonly<{
            TmxContents: any[][];
            apiKey: string; 
            fromWhere: any; 
            sourceCode: string; 
            targetCode: string;
        }>) {
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
        // Having hashtags and things in the contents was causing problems with
        // gooogle translate, so I'm replacing them here.
        this.setState({toTranslate: contents[newPair][1].replace(/#/g,"")})
        this.setState({source: contents[newPair][0].replace(/#/g,"")})
        this.setState({comment: ""})
        this.translate('&q=' + encodeURI(contents[newPair][1].replace(/#/g,"")), 
                                         contents[newPair][0].replace(/#/g,""))
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
  
    translate = (string_to_translate: string, original_string: string) => {
      console.log(string_to_translate)
  
      const requestOptions = {
        method: 'POST'
      };
      fetch(this.URL+string_to_translate, requestOptions)
        .then(res => res.json())
        .then(
          ( res ) => { 
           
            ///  adjust the match! 
            // This code is crazy, but it basically makes the possibility of getting a
            // 100% match higher, by shortening each word in the strings by 40%
            // and making everything lowercase and punctuation-free before comparing them
            let text = res.data.translations[0].translatedText.replace(/(&quot;)/g,"\"")
            console.log(text)
            
            let splitTranslated: string[] = []
            let splitOriginal: string[] = []
            let joinChar = '';

            // If the source language is JA, just replace spaces and split by each character
            if (this.props.sourceCode === 'ja') {
              splitTranslated = text.toLowerCase().replace(/[\s]/g, "").split('').map((b: string) => b.slice(0, b.length-Math.round(b.length * .4)))
              splitOriginal = original_string.toLowerCase().replace(/[\s]/g, "").split('').map((b: string) => b.slice(0, b.length-Math.round(b.length * .4)))
            } else {
              // if it's English, split by words and replace everything that's not a letter or space
              splitTranslated = text.toLowerCase().replace(/[^\w\s]/g, "").split(' ')//.map((b: string) => b.slice(0, b.length-Math.round(b.length * .4)))
              splitOriginal = original_string.toLowerCase().replace(/[^\w\s]/g, "").split(' ')//.map((b: string) => b.slice(0, b.length-Math.round(b.length * .4)))              
              joinChar = ' ';
            }
            // 

            const filteredArray = splitOriginal.filter((value) => !splitTranslated.includes(value));
            const filteredArrayTwo = splitTranslated.filter((value: string) => !splitOriginal.includes(value));
 
            let diff = Math.abs(filteredArray.concat(filteredArrayTwo).length - splitOriginal.length)
            let match = diff * 100/splitOriginal.length
            
            let translatedWithColors = splitTranslated.map((v: string) => {
              return (filteredArrayTwo.indexOf(v) > -1) ? ("<span style='color:red; font-weight: bold;'>" + v + "</span>") : v
            }).join(joinChar)

            let originalWithColors = splitOriginal.map((v: string) => {
              return (filteredArray.indexOf(v) > -1) ? ("<span style='color:red; font-weight: bold;'>" + v + "</span>") : v
            }).join(joinChar)

            
              
            this.setState({source: originalWithColors})
            this.setState({translated: translatedWithColors})

            
  
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
          <PageHeader modoru={true}></PageHeader>
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
            <div dangerouslySetInnerHTML={{__html: this.state.source}} />
            </Col>
            <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="block-example border border-primary">
              {this.state.toTranslate}
            </Col>
            <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="block-example border border-primary">
              <div dangerouslySetInnerHTML={{__html: this.state.translated}} />
            </Col>
          </Row>
          <Row style={{ marginTop: 50, marginBottom: 5}}>
                    <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">     
                <Form.Control as="textarea" value={this.state.comment} rows={3}  onChange={(e) => this.setState({comment: e.target.value})} />
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
  
    

export default ShowTmx;