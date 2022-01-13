import React from 'react';
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'

import LoginScreen from '../pages/LoginScreen'
import CheckOrEdit from '../pages/CheckOrEdit'


class PageHeader extends React.Component {

    constructor() {
      super();
      this.handleClick = this.handleClick.bind(this);
    }
  
    handleClick() {
      ReactDOM.render(
        <React.StrictMode>
          <CheckOrEdit />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
  
    handleLogoutClick() {
      ReactDOM.render(
        <React.StrictMode>
          <LoginScreen />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
  
    render() {
  
      return (
        <Container>
        <Row style={{marginTop: 10, backgroundColor: '#E6E6E6'}}>
        <Col style={{display:'flex', justifyContent:'left'}}>
        <Button 
              variant="warning" 
              size="sm" 
              onClick={this.handleClick}>
                戻る
            </Button>
        </Col>
        <Col style={{display:'flex', justifyContent:'right'}}>
        <Button 
              variant="danger" 
              size="sm" 
              onClick={this.handleLogoutClick}>
                ログアウト
            </Button>
        </Col>
        </Row>
        </Container>
      )
    }
  }

  export default PageHeader;