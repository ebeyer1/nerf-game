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
        id: 'citizen-1',
        name: 'Citizen',
        team: 'city'
      },
      {
        id: 'citizen-2',
        name: 'Citizen',
        team: 'city'
      },
      {
        id: 'citizen-3',
        name: 'Citizen',
        team: 'city'
      },
      {
        id: 'detective',
        name: 'Detective',
        team: 'city'
      },
      {
        id: 'undercover-cop',
        name: 'Undercover Cop',
        team: 'city'
      },
      {
        id: 'witch',
        name: 'Witch',
        team: 'city'
      },
      {
        id: 'mob-recruit-1',
        name: 'Mob Recruit',
        team: 'mob'
      },
      {
        id: 'mob-recruit-2',
        name: 'Mob Recruit',
        team: 'mob'
      },
      {
        id: 'mob-recruit-3',
        name: 'Mob Recruit',
        team: 'mob'
      },
      {
        id: 'mob-capo',
        name: 'Mob Capo',
        team: 'mob'
      },
      {
        id: 'mob-boss',
        name: 'Mob boss',
        team: 'mob'
      },
      {
        id: 'crooked-cop',
        name: 'Crooked Cop',
        team: 'mob'
      },
      {
        id: 'gunsmith',
        name: 'Gunsmith',
        team: 'city'
      },
      {
        id: 'thief',
        name: 'Thief',
        team: 'city'
      },
      {
        id: 'medic',
        name: 'Medic',
        team: 'city'
      },
      {
        id: 'mole',
        name: 'Mole',
        team: 'mob'
      },
      {
        id: 'psychic',
        name: 'Psychic',
        team: 'city'
      },
      {
        id: 'medium',
        name: 'Medium',
        team: 'city'
      },
      {
        id: 'Informant',
        name: 'Informant',
        team: 'city'
      },
      {
        id: 'priest',
        name: 'Priest',
        team: 'city'
      },
      {
        id: 'wizard',
        name: 'Wizard',
        team: 'city'
      },
      {
        id: 'martyr',
        name: 'Martyr',
        team: 'neutral'
      }
      // zombie, necro, and hitman
    ];

    let rows = roles.map((r) => {
      let selected = this.props.selectedRoles.indexOf(r.id) !== -1;
      let classString = "role " + r.team + (selected ? " selected" : "");

      return <Col span={4} className={classString} onClick={() => this.selectRole(r)}><div>{r.name}</div></Col>
    });

    // TODO - Let game owner change the roles in the lobby view as well. (use same RoleList component)

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
