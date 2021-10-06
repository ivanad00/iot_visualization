import React from "react";
import { fromFlux, Plot } from "@influxdata/giraffe";
import axios from "axios";
import "../app.css";

const REASONABLE_API_REFRESH_RATE = 5000;

export class LastValue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      table: {},
      lastUpdated: "",
    };
  }

  animationFrameId = 0;
  style = {
    width: "250px",
    height: "30px",
    margin: "40px",
  };

  getDataAndUpdateTable = async () => {
    const resp = await axios.get("http://localhost:3001/client/temp/2");

    try {
      let results = fromFlux(resp.data.csv);
      let currentDate = new Date();
      this.setState({
        table: results.table,
        lastUpdated: currentDate.toLocaleTimeString(),
      });
    } catch (error) {
      console.error("error", error.message);
    }
  };

  async componentDidMount() {
    try {
      this.getDataAndUpdateTable();
      this.animationFrameId = window.setInterval(
        this.getDataAndUpdateTable,
        REASONABLE_API_REFRESH_RATE
      );
    } catch (error) {
      console.error(error);
    }
  }

  componentWillUnmount = () => {
    window.clearInterval(this.animationFrameId);
  };

  renderPlot = () => {
    const config = {
      table: this.state.table,
      layers: [
        {
          type: "single stat",
          prefix: "",
          sufix: "suf",
          backgroundColor: "#6bb8ff",
        },
      ],

      legendFont: "12px sans-serif",
      tickFont: "12px sans-serif",
    };
    return (
      <>
        <div className="lastValue" style={this.style}>
          <div className="giraffe-layer giraffe-layer-single-stat">
            <div className="giraffe-single-stat--resizer">
              <Plot config={config} />
              <div className="state">Last updated {this.state.lastUpdated}</div>
              <svg className="giraffe-single-stat--svg">
                <text className="giraffe-single-stat--text"></text>
              </svg>
            </div>
          </div>
        </div>
      </>
    );
  };

  renderEmpty = () => {
    return (
      <div style={this.style}>
        <h3>Loading...</h3>
      </div>
    );
  };

  render = () => {
    return Object.keys(this.state.table).length > 0
      ? this.renderPlot()
      : this.renderEmpty();
  };
}
