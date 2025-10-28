import { Col, Divider, Row } from 'antd';
import React from 'react'
import CarouselComponent from '../../components/carousel/Carousel';
import card1 from '../../assets/CardInfo/imageCard.jpg';
import card2 from '../../assets/CardInfo/imageCard1.jpg';
import card3 from '../../assets/CardInfo/imageCard2.jpg';
import card4 from '../../assets/CardInfo/imageCard3.jpg';
import card5 from '../../assets/CardInfo/imageCard4.jpg';

const createStyle = (image) => ({
  backgroundImage: `url(${image})`, // ✅ correct way
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  padding: "8px",
  height: "160px",
  borderRadius: "8px",
  color: "white", // so text is readable
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold"
});

const DashboardPage = () => {
  return (
    <> 
      <CarouselComponent />

      <div>
        <Divider orientation="left">View Information</Divider>
        <Row gutter={[16,16]}>
          <Col className="gutter-row" span={6}>
            <div style={createStyle(card1)}>Experience</div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div style={createStyle(card2)}>Education</div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div style={createStyle(card3)}>Project</div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div style={createStyle(card4)}>Skill</div>
          </Col>

          <Col className="gutter-row" span={6}>
            <div style={createStyle(card5)}>col-6</div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div style={createStyle(card1)}>col-6</div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div style={createStyle(card2)}>col-6</div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div style={createStyle(card3)}>col-6</div>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default DashboardPage;
