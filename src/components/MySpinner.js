import CircularProgress from "@material-ui/core/CircularProgress";
import React from 'react';
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'


class MySpinner extends React.Component {

    render() {
      
      return (
        <Modal show="true" style={{ content: {borderRadius: '10px'}}}>
        <Modal.Body>
          <Container>
            <Row style={{margin: 10}}>
              <Col>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                  サーバーと接続しています
                </div>
              </Col>
            </Row>
            <Row style={{margin: 10, padding: 10}}>
              <Col>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                  <CircularProgress size={30} />	
                </div>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
      )
    }
  }

  export default MySpinner;