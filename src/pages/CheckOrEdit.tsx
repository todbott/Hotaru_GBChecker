import React from 'react';
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'

import GetTmx from './GetTmx';
import UpdateTmx from './UpdateTmx';
import MergeTmx from './MergeTmx';
import CreateTmx from './CreateTmx';
import PageHeader from '../components/PageHeader';

class CheckOrEdit extends React.Component<{}, {value: string}> {

    constructor() {
      super({});
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
  
      handleCreateClick() {
        ReactDOM.render(
          <React.StrictMode>
            <CreateTmx />
          </React.StrictMode>,
          document.getElementById('root')
        );
      }
  
      render() {
        return (
          <Container>
              <PageHeader modoru={false}></PageHeader>
            <Row style={{ marginTop: 50, marginBottom: 5}}>
              <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <h3>翻訳チェック・メモリ更新</h3>
              </Col>
            </Row>
            <Row style={{ marginTop: 20, marginBottom: 5}}>
            <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              納品されたトラドスプロジェクトから *.tmx ファイルを抽出してから...
              </Col>
            </Row>
            <Row>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <Button variant="secondary" size="lg" onClick={this.handleCheckClick}>逆引きチェックを行う</Button>
              </Col>
            </Row>
            <Row style={{ marginTop: 20, marginBottom: 5}}>
            <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              上記の逆引きチェックによってもし誤訳がありましたら、再翻訳が翻訳会社から頂いてから...
              </Col>
            </Row>
            <Row>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <Button variant="warning" size="lg" onClick={this.handleUpdateClick}>再翻訳によってメモリを更新</Button>
              </Col>
            </Row>
            <Row style={{ marginTop: 20, marginBottom: 5}}>
            <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              逆引きチェックによる誤訳がない場合、納品されたトラドスプロジェクトから *.tmx ファイル（またはただの原文・訳文テキスト）を使って...
              </Col>
            </Row>
            <Row>
              <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <Button variant="success" size="lg" onClick={this.handleMergeClick}>メイン翻訳メモリを更新</Button>
              </Col>
            </Row>
            <Row style={{ marginTop: 50, marginBottom: 5}}>
              <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <h3>メモリ作成・点検</h3>
              </Col>
            </Row>  
            <Row style={{ marginTop: 20, marginBottom: 5}}>
              <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                条件を選択してから、
              </Col>
            </Row>
            <Row>
                      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <Button variant="warning" size="lg" onClick={this.handleCreateClick}>メモリファイルをダウンロード・表示</Button>
              </Col>
            </Row>
          </Container>
        )}
  
    }

    export default CheckOrEdit;