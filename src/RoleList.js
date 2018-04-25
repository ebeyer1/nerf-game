import React, { Component } from "react";
import { Row, Col } from "antd";

import "./RoleList.css";

class RoleList extends Component {
  constructor(props) {
    super(props);
    
    this.selectRole = this.selectRole.bind(this);
  }
  
  selectRole(role) {
    this.props.onSelectRole(role);
  }
  
  render() {
    let roleString = this.props.selectedRoles.join(", ");
    
    const roles = [
      {
        name: 'Citizen',
        team: 'city'
      },
      {
        name: 'Detective',
        team: 'city'
      },
      {
        name: 'Undercover Cop',
        team: 'city'
      },
      {
        name: 'Witch',
        team: 'city'
      },
      {
        name: 'Mob Recruit',
        team: 'mob'
      },
      {
        name: 'Mob Capo',
        team: 'mob'
      },
      {
        name: 'Mob boss',
        team: 'mob'
      },
      {
        name: 'Crooked Cop',
        team: 'mob'
      },
      {
        name: 'Gunsmith',
        team: 'city'
      },
      {
        name: 'Thief',
        team: 'city'
      },
      {
        name: 'Medic',
        team: 'city'
      },
      {
        name: 'Mole',
        team: 'mob'
      },
      {
        name: 'Psychic',
        team: 'city'
      },
      {
        name: 'Medium',
        team: 'city'
      },
      {
        name: 'Informant',
        team: 'city'
      },
      {
        name: 'Priest',
        team: 'city'
      },
      {
        name: 'Wizard',
        team: 'city'
      },
      {
        name: 'Martyr',
        team: 'neutral'
      }
      // zombie, necro, and hitman
    ];
    
    let rows = roles.map((r) => {
      let selected = this.props.selectedRoles.indexOf(r.name) !== -1;
      let classString = "role " + r.team + (selected ? " selected" : "");
      
      return <Col span={4} className={classString} onClick={() => this.selectRole(r.name)}><div>{r.name}</div></Col>
    });
    
    return (
      <div className="role-list-container">
        <div>Selected Roles: {roleString}</div>
        <Row gutter={16}>
          {rows}
        </Row>
      </div>
    )
  }
}

export default RoleList;