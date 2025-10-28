import React from 'react';
import { Carousel } from 'antd';
import side1 from '../../assets/Carousel/side1.jpg';
import side2 from '../../assets/Carousel/side2.jpg';
import side3 from '../../assets/Carousel/side3.jpg';
import side4 from '../../assets/Carousel/side4.jpg';
import side5 from '../../assets/Carousel/side5.jpg';

const styleSideImage = {
  width: '100%',
   height: "250px",     // keep aspect ratio
  display: "block",   // block element
  margin: "0 auto"    // center image
  
};

const CarouselComponent = () => (
  <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
    <Carousel autoplay>
      <div>
        <img src={side1} alt="Slide 1" style={styleSideImage} />
      </div>
      <div>
        <img src={side2} alt="Slide 2" style={styleSideImage} />
      </div>
      <div>
        <img src={side3} alt="Slide 3" style={styleSideImage} />
      </div>
      <div>
        <img src={side4} alt="Slide 4" style={styleSideImage} />
      </div>
      <div>
        <img src={side5} alt="Slide 5" style={styleSideImage} />
      </div>
    </Carousel>
  </div>
);

export default CarouselComponent;
