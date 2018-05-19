import React, { Component } from "react";
import { Row, Col } from "antd";
import Roles from './Roles';

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

    let rows = Roles.map((r) => {
      let selected = this.props.selectedRoles.indexOf(r.id) !== -1;
      let classString = "role " + r.team + (selected ? " selected" : "");

      return <Col span={8} className={classString} onClick={() => this.selectRole(r)}><div>{r.name}</div></Col>
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
