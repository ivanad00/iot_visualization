import SimpleMap from "./components/mapGoogle.js";
import Header from "./components/header.js";
import { Band } from "./plotters/band.js";
import { LastValue } from "./plotters/lastValue.js";
import { AirQualityValue } from "./plotters/airQuality.js";
import { Co2 } from "./plotters/Co2Value.js";
import { Bar } from "./plotters/bar.js";
import { LineBar } from "./plotters/lineBar.js";
import { LineCO2 } from "./plotters/lineCO2.js";
import { LineTemp } from "./plotters/lineTemp.js";

import "./app.css";

function App() {

  return (
    <>
      <Header />
      <div className="page">
      
            <div className="style">
              <SimpleMap />
            </div>
            <div className="field">Air Temperature [°C] </div>
            <div className="style">
              <LastValue />
              <LineTemp />
            </div>
            <div className="field">Air Quality [%]</div>
            <div className="style">
              <AirQualityValue />
              <Band />
            </div>
            <div className="field">CO2 concentration [ppm] </div>
            <div className="style">
              <Co2 />
              <LineCO2 />
            </div>
            <div className="field">Barometric pressure [Pa]</div>
            <div className="style">
              <Bar />
              <LineBar />
            </div>
        )  
         
        
      </div>
    </>
  );
}

export default App;
