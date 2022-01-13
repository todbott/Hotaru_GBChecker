import React from 'react';
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';

import CheckOrEdit from './CheckOrEdit';



export default class LoginScreen extends React.Component<{}, { codeValue: string, controlType: string }> {
  constructor() {

    super({});
    this.state = {
        codeValue: '暗号を入力してください',
        controlType: 'text'
    }

    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
    
  }

  handleLoginClick() {
    if (this.state.codeValue === "hotaru") {
      ReactDOM.render(
        <React.StrictMode>
          <CheckOrEdit />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
  }

  handleCodeChange(event: { target: { value: any; }; }) {
    this.setState({controlType: 'password'})
    this.setState({codeValue: event.target.value})
  }

  render() {
    return (
      <Container>
      <Row>
        <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
          <FormControl type={this.state.controlType} value={this.state.codeValue} onChange={this.handleCodeChange}/>
        </Col>
      </Row>
      <Row style={{ marginTop: 5, marginBottom: 5}}>
        <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
        <Button variant="secondary" onClick={this.handleLoginClick}>
          ログイン</Button>
        </Col>
      </Row>
    </Container>
      )
    }
  }
