import React from 'react'
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';

import PageHeader from '../components/PageHeader';

import ShowTmx from  './ShowTmx'

class GetTmx extends React.Component<{}, {value: any, apiKey: string, sourceCode: string, targetCode: string, sourceKanji: string, targetKanji: string, fromWhere: any}> {
    constructor() {
        super({});
        this.state = {
          value: [],
          apiKey: "",
          sourceCode: "en",
          targetCode: "en",
          sourceKanji: "英語",
          targetKanji: "英語",
          fromWhere: 0
        };
        this.handleSubmit = this.handleSubmit.bind(this);
      }
    
      handleSubmit(event: { preventDefault: () => void;}) {
        event.preventDefault();
        const reader = new FileReader()
        reader.onload = async (event) => { 
          const text = (event.target!.result)
    
          var allForReturn = []
          var oneForReturn = []
    
          var XMLParser = require('react-xml-parser');
          var xml = new XMLParser().parseFromString(text);    
          var allTuvs = xml.getElementsByTagName('tuv');
          for (var t = 0; t < allTuvs.length; t++) {
            if (allTuvs[t].attributes['xml:lang'].indexOf(this.state.sourceCode.split("-")[0]) > -1) {
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
            <PageHeader></PageHeader>
            <Form>
              <Form.Group controlId="formFile" className="mb-3">
              <Row style={{ marginTop: 5, marginBottom: 5}}>
                <Col className="d-grid gap-2">    
                  <Form.Label style={{ marginTop: 5, marginBottom: 5}}>逆引きチェックしたい*.tmxファイルを選んでください</Form.Label>
                  <br />
                  <Form.Control type="file" onChange={(e) => this.setState({value: (e.target as HTMLInputElement).files![0]})} />
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
    

export default GetTmx;