"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";

export default function LanguageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const { isTransitioning, transitioningTo } = useLanguage();

  const renderFlag = () => {
    if (transitioningTo === 'en') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-90">
          <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
      );
    }
    if (transitioningTo === 'hu') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 1.5" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-90">
          <rect width="3" height="0.5" fill="#CE2939"/>
          <rect width="3" height="0.5" y="0.5" fill="#fff"/>
          <rect width="3" height="0.5" y="1" fill="#477050"/>
        </svg>
      );
    }
    if (transitioningTo === 'zh') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-90">
          <rect width="900" height="600" fill="#ee1c25"/>
          <g transform="translate(150, 150) scale(30)">
            <path d="M 0,-1 L 0.587785,0.809017 L -0.951056,-0.309017 L 0.951056,-0.309017 L -0.587785,0.809017 Z" fill="#ffff00"/>
          </g>
          <g transform="translate(300, 60) scale(10) rotate(23)">
            <path d="M 0,-1 L 0.587785,0.809017 L -0.951056,-0.309017 L 0.951056,-0.309017 L -0.587785,0.809017 Z" fill="#ffff00"/>
          </g>
          <g transform="translate(360, 120) scale(10) rotate(46)">
            <path d="M 0,-1 L 0.587785,0.809017 L -0.951056,-0.309017 L 0.951056,-0.309017 L -0.587785,0.809017 Z" fill="#ffff00"/>
          </g>
          <g transform="translate(360, 210) scale(10) rotate(70)">
            <path d="M 0,-1 L 0.587785,0.809017 L -0.951056,-0.309017 L 0.951056,-0.309017 L -0.587785,0.809017 Z" fill="#ffff00"/>
          </g>
          <g transform="translate(300, 270) scale(10) rotate(9)">
            <path d="M 0,-1 L 0.587785,0.809017 L -0.951056,-0.309017 L 0.951056,-0.309017 L -0.587785,0.809017 Z" fill="#ffff00"/>
          </g>
        </svg>
      );
    }
    return null;
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          transition: "opacity 0.6s cubic-bezier(0.8, 0, 0.2, 1), transform 0.7s cubic-bezier(0.8, 0, 0.2, 1), filter 0.7s ease",
          opacity: isTransitioning ? 0.95 : 0,
          transform: isTransitioning ? "scale(1.05) rotate(0deg)" : "scale(3.5) rotate(-15deg)",
          filter: isTransitioning ? "blur(0px) brightness(1.1)" : "blur(40px) brightness(0)",
          visibility: transitioningTo ? "visible" : "hidden",
          perspective: "1000px"
        }}
      >
        <div className="absolute inset-0 shadow-2xl">
          {renderFlag()}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div 
        style={{
          transition: "opacity 0.7s cubic-bezier(0.8, 0, 0.2, 1), filter 0.7s cubic-bezier(0.8, 0, 0.2, 1), transform 0.7s cubic-bezier(0.8, 0, 0.2, 1)",
          opacity: isTransitioning ? 0 : 1,
          filter: isTransitioning ? "blur(20px) saturate(0.5) contrast(0.8)" : "none",
          transform: isTransitioning ? "scale(0.92) translateY(40px) rotateX(10deg) translateZ(-100px)" : "none",
          transformOrigin: "center 20%",
          transformStyle: isTransitioning ? "preserve-3d" : "flat",
          perspective: isTransitioning ? "1200px" : "none"
        }}
      >
        {children}
      </div>
    </>
  );
}