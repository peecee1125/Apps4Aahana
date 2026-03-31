import Phaser from "phaser";
import {
  COLORS,
  FONTS,
  createCard,
  createNavHeader,
  getHS,
  paintPlayfulBackground,
  playSound,
} from "../utils.js";
import { mathPractice1, mathPractice2 } from "../data/mathQuestions.js";
import { elaPractice1, elaPractice2, elaPractice3 } from "../data/elaQuestions.js";
import { sciencePractice1, sciencePractice2, scienceAdvanced } from "../data/scienceQuestions.js";
import { geographyPractice1, geographyPractice2, geographyAdvanced } from "../data/geographyQuestions.js";
import { solarPractice1, solarPractice2, solarAdvanced } from "../data/solarSystemQuestions.js";
import { dinosaurPractice1, dinosaurPractice2, dinosaurAdvanced } from "../data/dinosaurQuestions.js";
import { funFactsPractice1, funFactsPractice2, funFactsAdvanced } from "../data/funFactsQuestions.js";
import { advancedMath, advancedScience, advancedELA, advancedWorld } from "../data/advancedQuestions.js";

const TESTS = {
  math: [
    { id: "math1",  label: "TCAP Practice 1",    sub: "Operations & Number Sense",       emoji: "\u{1F522}", questions: mathPractice1 },
    { id: "math2",  label: "TCAP Practice 2",    sub: "Measurement, Geometry & Data",    emoji: "\u{1F4D0}", questions: mathPractice2 },
  ],
  ela: [
    { id: "ela1",   label: "Practice 1",         sub: "Reading Comprehension",           emoji: "\u{1F4D6}", questions: elaPractice1 },
    { id: "ela2",   label: "Practice 2",         sub: "Language & Grammar",              emoji: "\u270D\uFE0F", questions: elaPractice2 },
    { id: "ela3",   label: "Practice 3",         sub: "Writing & Research",              emoji: "\u{1F4DD}", questions: elaPractice3 },
  ],
  science: [
    { id: "sci1",   label: "Life & Earth Science",  sub: "Animals, plants & seasons",   emoji: "\u{1F33F}", questions: sciencePractice1 },
    { id: "sci2",   label: "Physical Science",      sub: "Forces, matter & machines",   emoji: "\u2697\uFE0F", questions: sciencePractice2 },
    { id: "sci3",   label: "Science Challenge",     sub: "Advanced 2nd-3rd grade",      emoji: "\u{1F52C}", questions: scienceAdvanced },
  ],
  geography: [
    { id: "geo1",   label: "Continents & Oceans",  sub: "Maps, directions & borders",   emoji: "\u{1F30D}", questions: geographyPractice1 },
    { id: "geo2",   label: "Landforms & Places",   sub: "Mountains, rivers & states",   emoji: "\u{1F5FA}\uFE0F", questions: geographyPractice2 },
    { id: "geo3",   label: "Geography Challenge",  sub: "Advanced 2nd-3rd grade",       emoji: "\u{1F9ED}", questions: geographyAdvanced },
  ],
  solar: [
    { id: "sol1",   label: "Planets & the Sun",    sub: "8 planets, stargazing basics", emoji: "\u{1FA90}", questions: solarPractice1 },
    { id: "sol2",   label: "Moon, Stars & Space",  sub: "Orbits, phases & eclipses",    emoji: "\u{1F319}", questions: solarPractice2 },
    { id: "sol3",   label: "Space Challenge",      sub: "Advanced 2nd-3rd grade",       emoji: "\u{1F680}", questions: solarAdvanced },
  ],
  dinosaurs: [
    { id: "dino1",  label: "Famous Dinosaurs",     sub: "T-Rex, Triceratops & more",    emoji: "\u{1F996}", questions: dinosaurPractice1 },
    { id: "dino2",  label: "Periods & Fossils",    sub: "Triassic, Jurassic, Cretaceous", emoji: "\u{1F9B4}", questions: dinosaurPractice2 },
    { id: "dino3",  label: "Dino Challenge",       sub: "Advanced 2nd-3rd grade",       emoji: "\u{1F50D}", questions: dinosaurAdvanced },
  ],
  facts: [
    { id: "facts1", label: "Amazing Animals",      sub: "Speed, size & world records",  emoji: "\u{1F4A1}", questions: funFactsPractice1 },
    { id: "facts2", label: "World Wonders",        sub: "Human body, nature & records", emoji: "\u{1F31F}", questions: funFactsPractice2 },
    { id: "facts3", label: "Facts Challenge",      sub: "Advanced 2nd-3rd grade",       emoji: "\u{1F9E0}", questions: funFactsAdvanced },
  ],
  advanced: [
    { id: "adv1",   label: "Math Challenge",       sub: "Multiplication, fractions & more", emoji: "\u{1F522}", questions: advancedMath },
    { id: "adv2",   label: "Science Challenge",    sub: "Ecosystems, chemistry & space",    emoji: "\u{1F52C}", questions: advancedScience },
    { id: "adv3",   label: "ELA Challenge",        sub: "Inference, vocabulary & grammar",  emoji: "\u{1F4DA}", questions: advancedELA },
    { id: "adv4",   label: "World Challenge",      sub: "History, culture & geography",     emoji: "\u{1F310}", questions: advancedWorld },
  ],
};

const THEME = {
  math:      { title: "\u{1F522} Math Quiz",      color: COLORS.btn,    panel: COLORS.panel },
  ela:       { title: "\u{1F4D6} ELA Quiz",       color: COLORS.btnAlt, panel: COLORS.panelAlt },
  science:   { title: "\u{1F9EA} Science",        color: 0x6bcb77,      panel: 0x2a5e35 },
  geography: { title: "\u{1F30D} Geography",      color: 0xffb347,      panel: 0x5e3e1a },
  solar:     { title: "\u2600\uFE0F Solar System", color: 0xb39ddb,    panel: 0x3d2b6a },
  dinosaurs: { title: "\u{1F996} Dinosaurs",      color: 0xef476f,      panel: 0x5e1a2b },
  facts:     { title: "\u{1F4A1} Fun Facts",      color: 0x2ec4b6,      panel: 0x1a4a48 },
  advanced:  { title: "\u2B50 Advanced",          color: 0xffd93d,      panel: 0x4e3c00 },
};

export class SubjectMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "SubjectMenuScene" });
  }

  init(data) {
    this.subject = data?.subject || "math";
  }

  create() {
    const { width, height } = this.scale;
    const tests = TESTS[this.subject];
    const theme = THEME[this.subject] || THEME.math;
    const baseColor = theme.color;
    const hoverColor = this._lighten(baseColor);

    paintPlayfulBackground(this);
    createNavHeader(this, { title: theme.title, showHome: true });

    const { card: headerCard } = createCard(
      this,
      width / 2,
      height * 0.12,
      Math.min(width * 0.88, 600),
      Math.min(height * 0.1, 114),
      theme.panel,
    );
    headerCard.setAlpha(0.94);

    this.add
      .text(width / 2, height * 0.09, "Choose a practice path:", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(32, width * 0.054)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.13, "Earn stars and beat your high score! \u2B50", {
        fontFamily: FONTS.body,
        fontSize: `${Math.min(22, width * 0.036)}px`,
        color: COLORS.text,
      })
      .setOrigin(0.5);

    const btnW = Math.min(width * 0.84, 540);
    const btnH = Math.min(height * 0.13, 148);
    const btnGap = Math.min(height * 0.022, 24);
    const startY = height * 0.24;

    tests.forEach((test, i) => {
      const y = startY + i * (btnH + btnGap) + btnH / 2;
      const hs = getHS(test.id);
      const stars = hs >= 90 ? "\u2B50\u2B50\u2B50" : hs >= 70 ? "\u2B50\u2B50" : hs > 0 ? "\u2B50" : "";
      const hsLabel = hs > 0 ? `Best: ${hs} / 100  ${stars}` : "Not played yet";

      const shadow = this.add.rectangle(width / 2, y + 8, btnW, btnH, 0x120a22, 0.28);
      const btn = this.add
        .rectangle(width / 2, y, btnW, btnH, baseColor)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          btn.setFillStyle(hoverColor);
          this.tweens.add({ targets: btn, scaleX: 1.02, scaleY: 1.02, duration: 70 });
        })
        .on("pointerout", () => {
          btn.setFillStyle(baseColor);
          this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 70 });
        })
        .on("pointerdown", () => {
          playSound(this, "click");
          this.scene.start("TCAPQuizScene", {
            testId: test.id,
            testLabel: `${theme.title} \u2022 ${test.label}`,
            questions: test.questions,
            subject: this.subject,
          });
        });
      btn.setStrokeStyle(4, 0xffffff, 0.18);
      shadow.setDepth(0);

      this.add
        .text(width / 2, y - btnH * 0.23, `${test.emoji}  ${test.label}`, {
          fontFamily: FONTS.display,
          fontSize: `${Math.min(32, width * 0.056)}px`,
          fontStyle: "bold",
          color: COLORS.text,
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, y + btnH * 0.04, test.sub, {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(20, width * 0.034)}px`,
          color: COLORS.text,
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, y + btnH * 0.31, hsLabel, {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(18, width * 0.03)}px`,
          color: COLORS.accent,
        })
        .setOrigin(0.5);
    });
  }

  _lighten(color) {
    const r = Math.min(255, ((color >> 16) & 0xff) + 40);
    const g = Math.min(255, ((color >> 8) & 0xff) + 40);
    const b = Math.min(255, (color & 0xff) + 40);
    return (r << 16) | (g << 8) | b;
  }
}
