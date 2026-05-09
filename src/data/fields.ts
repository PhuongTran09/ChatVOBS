import { fonts } from "./fonts";
import type { FieldGroup } from "../types/customizer";

export const fields: FieldGroup[] = [
  {
    title: "Fonts",
    controls: [

      { id: "outline-size", label: "Outline size", type: "number", value: "0" },
      { id: "outline-color", label: "Outline color", type: "color", value: "#000000" },
    ],
    checkboxes: [
      { id: "show-outlines", label: "Show outlines", type: "checkbox", checked: true },
    ],
  },
  {
    title: "Avatars",
    controls: [

      { id: "avatar-size", label: "Avatar size", type: "number", value: "24" },
      { id: "avatar-padding", label: "Avatar padding", type: "number", value: "0" },
      { id: "avatar-border-size", label: "Avatar border size", type: "number", value: "0" },
      { id: "avatar-border-color", label: "Avatar border color", type: "color", value: "#ffffff" },
      { id: "avatar-margin-top", label: "Avatar margin top", type: "number", value: "0" },
      { id: "avatar-margin-right", label: "Avatar margin right", type: "number", value: "6" },
      { id: "avatar-margin-bottom", label: "Avatar margin bottom", type: "number", value: "0" },
      { id: "avatar-margin-left", label: "Avatar margin left", type: "number", value: "0" },
    ],
    checkboxes: [
      { id: "show-avatars", label: "Show avatars", type: "checkbox", checked: true },
    ],
  },
  {
    title: "Channel names",
    controls: [
      { id: "author-font-family", label: "Font", type: "select", value: "Changa One", options: fonts },
      { id: "author-owner-font-family", label: "Owner Font", type: "select", value: "Changa One", options: fonts },
      { id: "author-moderator-font-family", label: "Moderator Font", type: "select", value: "Changa One", options: fonts },
      { id: "author-member-font-family", label: "Sponsor Font", type: "select", value: "Changa One", options: fonts },
      { id: "author-font-size", label: "Font size", type: "number", value: "20" },
      { id: "author-line-height", label: "Line height (0 for default)", type: "number", value: "0" },
      { id: "author-color", label: "Color", type: "color", value: "#cccccc" },
      { id: "author-owner-color", label: "Owner color", type: "color", value: "#ffd600" },
      { id: "author-moderator-color", label: "Moderator color", type: "color", value: "#5e84f1" },
      { id: "author-member-color", label: "Sponsor color", type: "color", value: "#0f9d58" },
      
      { id: "author-padding", label: "Padding", type: "number", value: "0" },
      { id: "author-border-size", label: "Border size", type: "number", value: "0" },
      { id: "author-border-color", label: "Border color", type: "color", value: "#ffffff" },
      { id: "author-border-radius", label: "Border radius", type: "number", value: "0" },
      { id: "author-margin-top", label: "Margin top", type: "number", value: "0" },
      { id: "author-margin-right", label: "Margin right", type: "number", value: "0" },
      { id: "author-margin-bottom", label: "Margin bottom", type: "number", value: "0" },
      { id: "author-margin-left", label: "Margin left", type: "number", value: "0" },
    ],
    checkboxes: [
      { id: "show-badges", label: "Show badges", type: "checkbox", checked: false },
      { id: "show-colon", label: "Show colon after name", type: "checkbox", checked: true },
    ],
  },
  {
    title: "Messages",

    checkboxes: [
      { id: "message-newline", label: "On new line", type: "checkbox", checked: false },
    ],

    colors: [
      { id: "message-background-color", label: "Message background color", type: "color-range", value: "#cccccc", rangeId: "message-background-opacity", rangeValue: "0" },
      { id: "owner-message-background-color", label: "Owner message background color", type: "color-range", value: "#ffd600", rangeId: "owner-message-background-opacity", rangeValue: "0" },
      { id: "moderator-message-background-color", label: "Moderator message background color", type: "color-range", value: "#5e84f1", rangeId: "moderator-message-background-opacity", rangeValue: "0" },
      { id: "member-message-background-color", label: "Sponsor message background color", type: "color-range", value: "#0f9d58", rangeId: "member-message-background-opacity", rangeValue: "0" },
      
      { id: "message-color", label: "Fallback/Paid text color", type: "color", value: "#ffffff" },
      { id: "message-text-color", label: "Message text color", type: "color", value: "#ffffff" },
      { id: "message-border-color", label: "Message border color", type: "color", value: "#ffffff" },
      { id: "content-border-color", label: "Content border color", type: "color", value: "#ffffff" },
    ],

    controls: [
      { id: "message-font-family", label: "Font", type: "select", value: "Imprima", options: fonts },
      { id: "message-font-size", label: "Font size", type: "number", value: "18" },
      { id: "message-line-height", label: "Line height", type: "number", value: "0" },
      { id: "message-letter-spacing", label: "Letter spacing", type: "number", value: "0" },

      { id: "message-padding", label: "Message padding", type: "number", value: "0" },
      { id: "message-border-size", label: "Message border size", type: "number", value: "0" },
      { id: "message-border-radius", label: "Message border radius", type: "number", value: "0" },

      { id: "message-margin-top", label: "Message margin top", type: "number", value: "0" },
      { id: "message-margin-right", label: "Message margin right", type: "number", value: "0" },
      { id: "message-margin-bottom", label: "Message margin bottom", type: "number", value: "0" },
      { id: "message-margin-left", label: "Message margin left", type: "number", value: "0" },

      { id: "content-border-size", label: "Content border size", type: "number", value: "0" },
      { id: "content-border-radius", label: "Content border radius", type: "number", value: "0" },
    ],
  },
  {
    title: "Timestamps",

    checkboxes: [
      { id: "show-timestamps", label: "Show timestamps", type: "checkbox", checked: false },
    ],

    colors: [
      { id: "timestamp-color", label: "Color", type: "color", value: "#999999" },
    ],

    controls: [
      { id: "timestamp-font-family", label: "Font", type: "select", value: "Imprima", options: fonts },
      { id: "timestamp-font-size", label: "Font size", type: "number", value: "16" },
      { id: "timestamp-line-height", label: "Line height (0 for default)", type: "number", value: "0" },
    ],
  },
  {
    title: "Backgrounds",

    checkboxes: [
      { id: "use-gradient-backgrounds", label: "Use gradient backgrounds", type: "checkbox", checked: true },
    ],

    colors: [
      { id: "background-color", label: "Background color", type: "color-range", value: "#000000", rangeId: "background-opacity", rangeValue: "0" },
      { id: "author-background-color", label: "Channel name background", type: "color-range", value: "#ffffff", rangeId: "author-background-opacity", rangeValue: "0" },
      { id: "author-owner-background-color", label: "Owner channel name background", type: "color-range", value: "#ffd600", rangeId: "author-owner-background-opacity", rangeValue: "0" },
      { id: "author-moderator-background-color", label: "Moderator channel name background", type: "color-range", value: "#5e84f1", rangeId: "author-moderator-background-opacity", rangeValue: "0" },
      { id: "author-member-background-color", label: "Sponsor channel name background", type: "color-range", value: "#0f9d58", rangeId: "author-member-background-opacity", rangeValue: "0" },
    ],
  },
  {
    title: "SuperChat/Fan Funding/Sponsors",

    checkboxes: [
      { id: "show-fan-funding-background", label: "Show Sponsor/Fan Funding background", type: "checkbox", checked: true },

      { id: "show-ticker", label: "Show SuperChat ticker", type: "checkbox", checked: false },

      { id: "show-everything", label: "Show everything other than SuperChat ticker", type: "checkbox", checked: true },
    ],

    colors: [
      { id: "fan-funding-first-line-color", label: "First line color", type: "color", value: "#ffffff" },

      { id: "fan-funding-second-line-color", label: "Second line color", type: "color", value: "#ffffff" },

      { id: "super-chat-content-color", label: "SuperChat content color", type: "color", value: "#ffffff" },
    ],

    controls: [
      { id: "fan-funding-first-line-font-family", label: "First line font", type: "select", value: "Changa One", options: fonts },

      { id: "fan-funding-first-line-font-size", label: "First line font size", type: "number", value: "20" },

      { id: "fan-funding-first-line-line-height", label: "First line line height (0 for default)", type: "number", value: "0" },

      { id: "fan-funding-second-line-font-family", label: "Second line font", type: "select", value: "Imprima", options: fonts },

      { id: "fan-funding-second-line-font-size", label: "Second line font size", type: "number", value: "18" },

      { id: "fan-funding-second-line-line-height", label: "Second line line height (0 for default)", type: "number", value: "0" },

      { id: "super-chat-content-font-family", label: "SuperChat content font", type: "select", value: "Imprima", options: fonts },

      { id: "super-chat-content-font-size", label: "SuperChat content font size", type: "number", value: "18" },

      { id: "super-chat-content-line-height", label: "SuperChat content line height (0 for default)", type: "number", value: "0" },
    ],
  },
  {
    title: "Animation",
    controls: [
      { id: "animation-in", label: "Animate in", type: "checkbox", checked: false },
      { id: "animation-in-time", label: "Fade in time (milliseconds)", type: "number", value: "200" },

      { id: "animation-wait-time", label: "Wait time (seconds)", type: "number", value: "30" },
      { id: "animation-out-time", label: "Fade out time (milliseconds)", type: "number", value: "200" },


    ],
    checkboxes: [
      { id: "animation-out", label: "Animate out (remove old messages)", type: "checkbox", checked: false },
      { id: "animation-slide", label: "Slide", type: "checkbox", checked: false },
      { id: "animation-reverse", label: "Reverse slide", type: "checkbox", checked: false },
    ],
  },
];