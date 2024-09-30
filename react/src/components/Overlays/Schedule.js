import React, { useState, useEffect } from 'react';
import "../../Styles/Schedule.css";

const Schedule = () => {



    return (
        <div>

            <img style={{ position: "absolute", opacity: ".0" }} width={1920} height={1080} src="/schedule.png" />

            <div style={{
                position: "absolute",
                background: "black",
                width: "487px",
                height: "146px",
                borderRadius: "20px",
                flexDirection: "row",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                left: "267px",
                top: "285px"
            }}>
                <div style={{
                    width: "375px",
                    height: "114px",

                    fontFamily: 'Poppins',
                    fontStyle: "normal", fontWeight: 600,
                    fontSize: "76px",
                    lineHeight: "114px",
                    color: "white"
                }}>
                    Aikataulu
                </div>
            </div>

            <div style={{
                position: "absolute",
                background: "black",
                left: "265px",
                top: "470px",
                width: "986px",
                height: "324px",
                borderRadius: "10px",
                fontSize: "130%",
                display: "flex",
                alignItems: "center"
            }}>
                <div className="schedule-list" style={{
                    position: "absolute", zIndex: 1000, color: "white",
                    left: "55px"
                }}>
                    <div>
                         17:00 - AMA

                    </div>
                    <div>
                    18:00 - Projektien Demot
                    </div>
                    <div>
                    19:00 - General Chatter
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Schedule;
