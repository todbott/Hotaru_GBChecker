import React, { Component } from 'react';
import {Row, Col, Button, ButtonGroup } from 'react-bootstrap'

class CustomerPicker extends React.Component<{onChangeValue: any},{
  BiwakoVariant: string,
  KanaokaVariant: string,
  DaikinGeneralVariant: string,
  LogosVariant: string,
  HyodVariant: string,
  OkKizaiVariant: string,
  HotaruThaiVariant: string,
  ToliVariant: string,
}> {
  constructor() {
    super({
      onChangeValue: null
    });
    this.state = {
      BiwakoVariant: 'secondary',
      KanaokaVariant: 'secondary',
      DaikinGeneralVariant: 'secondary',
      LogosVariant: 'secondary',
      HyodVariant: 'secondary',
      OkKizaiVariant: 'secondary',
      HotaruThaiVariant: 'secondary',
      ToliVariant: 'secondary',
    }
  }
render() {

return (
  <div>
    <Row style={{ marginTop: 5, marginBottom: 5}}>
      <Col style={{justifyContent: 'center', display: 'flex', alignItems: 'center' }} className="d-grid gap-2">    
      <ButtonGroup style={{ marginTop: 10, marginBottom: 10}} aria-label="金岡案件">
      <Button variant={this.state.BiwakoVariant} onClick={() => {
            this.props.onChangeValue(['shinpuku@hotaru.ltd', 'K']);
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
            this.props.onChangeValue(['nishino@hotaru.ltd', 'B'])
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
            this.props.onChangeValue(['gillies@hotaru.ltd', 'DaikinGeneral'])
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
            this.props.onChangeValue(['kotera@hotaru.ltd', 'L'])
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
            this.props.onChangeValue(['tanaka@hotaru.ltd', 'HotaruThai'])
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
            this.props.onChangeValue(['kotera@hotaru.ltd', 'Hyod'])
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
            this.props.onChangeValue(['shinpuku@hotaru.ltd', 'OkKizai'])
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
            this.props.onChangeValue(['kotera@hotaru.ltd', 'Toli'])
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
                    
     

  </div>

  );
}
}
export default CustomerPicker;