import React, { useState, useEffect, useMemo } from "react";
import Button from "./Button.jsx";
import "./CardSelect.css";

const upper = 20;
const bellow = 180;

const _markers = [
  { key: "18", x: 15, y: upper },
  { key: "17", x: 45, y: upper },
  { key: "16", x: 75, y: upper },
  { key: "15", x: 105, y: upper },
  { key: "14", x: 135, y: upper },
  { key: "13", x: 165, y: upper },
  { key: "12", x: 195, y: upper },
  { key: "11", x: 225, y: upper },
  { key: "21", x: 255, y: upper },
  { key: "22", x: 285, y: upper },
  { key: "23", x: 315, y: upper },
  { key: "24", x: 345, y: upper },
  { key: "25", x: 375, y: upper },
  { key: "26", x: 405, y: upper },
  { key: "27", x: 435, y: upper },
  { key: "28", x: 465, y: upper },

  { key: "48", x: 15, y: bellow },
  { key: "47", x: 45, y: bellow },
  { key: "46", x: 75, y: bellow },
  { key: "45", x: 105, y: bellow },
  { key: "44", x: 135, y: bellow },
  { key: "43", x: 165, y: bellow },
  { key: "42", x: 195, y: bellow },
  { key: "41", x: 225, y: bellow },
  { key: "31", x: 255, y: bellow },
  { key: "32", x: 285, y: bellow },
  { key: "33", x: 315, y: bellow },
  { key: "34", x: 345, y: bellow },
  { key: "35", x: 375, y: bellow },
  { key: "36", x: 405, y: bellow },
  { key: "37", x: 435, y: bellow },
  { key: "38", x: 465, _x: 625, y: bellow }
];

const getBackgroundColor = (isSelected, card) => {
  let color = "white";
  if (isSelected) color = "#e6f7ff";
  if (card?.basicMaterial?.Color) color = "#dedede";
  if (card?.productValue?.colorTooth) color = card?.productValue?.colorTooth;
  return color;
};

const CardSelect = ({ mk, sk, finalMarkers = () => {}, callbackValues, callbackEvent, lines = true, linesColor = "#e6e6e6" }) => {
  const [disabled, setDisabled] = useState(true);
  const [markers, setMarkers] = useState(mk ?? _markers);
  const [selectedKeys, setSelectedKeys] = useState(sk ?? []);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const { lang } = useMemo(() => ({ lang: {} }), []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    finalMarkers(selectedKeys);
    if (callbackValues) callbackValues(selectedKeys);
    if (callbackEvent) callbackEvent({ type: "selection", values: selectedKeys });
  }, [selectedKeys]);

  const toggleCardSelection = (card) => {
    setSelectedKeys((prev) => (prev.includes(card.key) ? prev.filter((k) => k !== card.key) : [...prev, card.key]));
  };

  const addCardToSelection = (card) => {
    setSelectedKeys((prev) => (prev.includes(card.key) ? prev : [...prev, card.key]));
  };

  const renderCard = (card) => {
    const isSelected = selectedKeys.includes(card?.key);
    return (
      <div
        key={card?.key}
        className={`no-select custom-card-tooth ${isSelected ? "selected" : ""}`}
        onMouseDown={(e) => {
          if (e.button === 0) {
            setIsMouseDown(true);
            toggleCardSelection(card);
          }
        }}
        onMouseOver={() => {
          if (isMouseDown) addCardToSelection(card);
        }}
        style={{ backgroundColor: getBackgroundColor(isSelected, card) }}
      >
        <div className="card-header-tooth" style={{ zIndex: 2 }}>{card?.key}</div>
        <div title={card?.basicMaterial?.MaterialTypeLabel} className="card-body-tooth">
          {card?.basicMaterial?.MaterialTypeLabel}
        </div>
        <div
          title={(card?.colorLotRef && card?.colorLotRef?.length > 0) ? card?.colorLotRef.map((el) => JSON.stringify(el, null, 4)) : ""}
          className="card-body-tooth"
        >
          {(card?.colorLotRef && card?.colorLotRef?.length > 0) ? "colors" : ""}
        </div>
        <div title={card?.productValue?.label} className="card-body-tooth">
          {card?.productValue?.label ? " " + card?.productValue?.label + " " : ""}
        </div>
        <div title={card?.basicMaterial?.MaterialTypeLabel} className="card-body-tooth">
          {card?.basicMaterial?.disk ? " " + card?.basicMaterial?.disk + " " : ""}
        </div>
        <div className="card-footer-tooth">
          <div className="card-footer-tooth-multi">
            {card?.clen ? <b>X</b> : ""}
            {card?.ankerValues?.value ? " A " : ""}
            {card?.implantatValues ? " I " : ""}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fieldsInline001 fieldsInlineTeeth">
        <Button
          title={lang?.["clearSelectedDescription"] ?? "clearSelectedDescription"}
          type="delete"
          style={{ float: "end" }}
          onClick={() => setSelectedKeys([])}
          disabled={selectedKeys?.length === 0}
        >
          {lang?.["clearSelected"] ?? "clearSelected"}
        </Button>

        <Button
          title={lang?.["selectAllDescription"] ?? "selectAllDescription"}
          type="ok"
          style={{ float: "end" }}
          onClick={() => setSelectedKeys(_markers.map((el) => el.key))}
        >
          {lang?.["selectAll"] ?? "selectAll"}
        </Button>

        <Button
          title={lang?.["clearLastSelectedOneAtOnceDescription"] ?? "clearLastSelectedOneAtOnceDescription"}
          type="cancel"
          style={{ float: "end" }}
          onClick={() => setSelectedKeys((prev) => prev.slice(0, -1))}
          disabled={selectedKeys?.length === 0}
        >
          {lang?.["clearLastSelectedOneAtOnce"] ?? "clearLastSelectedOneAtOnce"}
        </Button>
      </div>

      <div className="bodyTeeth">
        <div className="bodyTeeth-first-row">{markers.slice(0, 16).map((m) => renderCard(m))}</div>
        <div className="bodyTeeth-second-row">{markers.slice(16, 32).map((m) => renderCard(m))}</div>
        {lines && <div className="horizontal-line-h" style={{ backgroundColor: linesColor }} />}
        {lines && <div className="vertical-line-v" style={{ backgroundColor: linesColor }} />}
      </div>
    </>
  );
};

export default CardSelect;
