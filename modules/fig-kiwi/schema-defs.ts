export type MessageType =
  "JOIN_START" |
  "NODE_CHANGES" |
  "USER_CHANGES" |
  "JOIN_END" |
  "SIGNAL" |
  "STYLE" |
  "STYLE_SET" |
  "JOIN_START_SKIP_RELOAD" |
  "NOTIFY_SHOULD_UPGRADE" |
  "UPGRADE_DONE" |
  "UPGRADE_REFRESH" |
  "SCENE_GRAPH_QUERY" |
  "SCENE_GRAPH_REPLY" |
  "DIFF" |
  "CLIENT_BROADCAST";

export type Axis =
  "X" |
  "Y";

export type Access =
  "READ_ONLY" |
  "READ_WRITE";

export type NodePhase =
  "CREATED" |
  "REMOVED";

export type WindingRule =
  "NONZERO" |
  "ODD";

export type NodeType =
  "NONE" |
  "DOCUMENT" |
  "CANVAS" |
  "GROUP" |
  "FRAME" |
  "BOOLEAN_OPERATION" |
  "VECTOR" |
  "STAR" |
  "LINE" |
  "ELLIPSE" |
  "RECTANGLE" |
  "REGULAR_POLYGON" |
  "ROUNDED_RECTANGLE" |
  "TEXT" |
  "SLICE" |
  "SYMBOL" |
  "INSTANCE" |
  "STICKY" |
  "SHAPE_WITH_TEXT" |
  "CONNECTOR" |
  "CODE_BLOCK" |
  "WIDGET" |
  "STAMP" |
  "MEDIA" |
  "HIGHLIGHT" |
  "SECTION" |
  "SECTION_OVERLAY" |
  "WASHI_TAPE" |
  "VARIABLE";

export type ShapeWithTextType =
  "SQUARE" |
  "ELLIPSE" |
  "DIAMOND" |
  "TRIANGLE_UP" |
  "TRIANGLE_DOWN" |
  "ROUNDED_RECTANGLE" |
  "PARALLELOGRAM_RIGHT" |
  "PARALLELOGRAM_LEFT" |
  "ENG_DATABASE" |
  "ENG_QUEUE" |
  "ENG_FILE" |
  "ENG_FOLDER";

export type BlendMode =
  "PASS_THROUGH" |
  "NORMAL" |
  "DARKEN" |
  "MULTIPLY" |
  "LINEAR_BURN" |
  "COLOR_BURN" |
  "LIGHTEN" |
  "SCREEN" |
  "LINEAR_DODGE" |
  "COLOR_DODGE" |
  "OVERLAY" |
  "SOFT_LIGHT" |
  "HARD_LIGHT" |
  "DIFFERENCE" |
  "EXCLUSION" |
  "HUE" |
  "SATURATION" |
  "COLOR" |
  "LUMINOSITY";

export type PaintType =
  "SOLID" |
  "GRADIENT_LINEAR" |
  "GRADIENT_RADIAL" |
  "GRADIENT_ANGULAR" |
  "GRADIENT_DIAMOND" |
  "IMAGE" |
  "EMOJI";

export type ImageScaleMode =
  "STRETCH" |
  "FIT" |
  "FILL" |
  "TILE";

export type EffectType =
  "INNER_SHADOW" |
  "DROP_SHADOW" |
  "FOREGROUND_BLUR" |
  "BACKGROUND_BLUR";

export type TextCase =
  "ORIGINAL" |
  "UPPER" |
  "LOWER" |
  "TITLE" |
  "SMALL_CAPS" |
  "SMALL_CAPS_FORCED";

export type TextDecoration =
  "NONE" |
  "UNDERLINE" |
  "STRIKETHROUGH";

export type NumberUnits =
  "RAW" |
  "PIXELS" |
  "PERCENT";

export type ConstraintType =
  "MIN" |
  "CENTER" |
  "MAX" |
  "STRETCH" |
  "SCALE" |
  "FIXED_MIN" |
  "FIXED_MAX";

export type StrokeAlign =
  "CENTER" |
  "INSIDE" |
  "OUTSIDE";

export type StrokeCap =
  "NONE" |
  "ROUND" |
  "SQUARE" |
  "ARROW_LINES" |
  "ARROW_EQUILATERAL" |
  "DIAMOND_FILLED" |
  "TRIANGLE_FILLED" |
  "HIGHLIGHT" |
  "WASHI_TAPE_1" |
  "WASHI_TAPE_2" |
  "WASHI_TAPE_3" |
  "WASHI_TAPE_4" |
  "WASHI_TAPE_5" |
  "WASHI_TAPE_6" |
  "CIRCLE_FILLED";

export type StrokeJoin =
  "MITER" |
  "BEVEL" |
  "ROUND";

export type BooleanOperation =
  "UNION" |
  "INTERSECT" |
  "SUBTRACT" |
  "XOR";

export type TextAlignHorizontal =
  "LEFT" |
  "CENTER" |
  "RIGHT" |
  "JUSTIFIED";

export type TextAlignVertical =
  "TOP" |
  "CENTER" |
  "BOTTOM";

export type MouseCursor =
  "DEFAULT" |
  "CROSSHAIR" |
  "EYEDROPPER" |
  "HAND" |
  "PAINT_BUCKET" |
  "PEN" |
  "PENCIL" |
  "MARKER" |
  "ERASER" |
  "HIGHLIGHTER";

export type VectorMirror =
  "NONE" |
  "ANGLE" |
  "ANGLE_AND_LENGTH";

export type DashMode =
  "CLIP" |
  "STRETCH";

export type ImageType =
  "PNG" |
  "JPEG" |
  "SVG" |
  "PDF";

export type ExportConstraintType =
  "CONTENT_SCALE" |
  "CONTENT_WIDTH" |
  "CONTENT_HEIGHT";

export type LayoutGridType =
  "MIN" |
  "CENTER" |
  "STRETCH" |
  "MAX";

export type LayoutGridPattern =
  "STRIPES" |
  "GRID";

export type TextAutoResize =
  "NONE" |
  "WIDTH_AND_HEIGHT" |
  "HEIGHT";

export type TextTruncation =
  "DISABLED" |
  "ENDING";

export type StyleSetType =
  "PERSONAL" |
  "TEAM" |
  "CUSTOM" |
  "FREQUENCY" |
  "TEMPORARY";

export type StyleSetContentType =
  "SOLID" |
  "GRADIENT" |
  "IMAGE";

export type StackMode =
  "NONE" |
  "HORIZONTAL" |
  "VERTICAL";

export type StackAlign =
  "MIN" |
  "CENTER" |
  "MAX" |
  "BASELINE";

export type StackCounterAlign =
  "MIN" |
  "CENTER" |
  "MAX" |
  "STRETCH" |
  "AUTO" |
  "BASELINE";

export type StackJustify =
  "MIN" |
  "CENTER" |
  "MAX" |
  "SPACE_EVENLY";

export type StackSize =
  "FIXED" |
  "RESIZE_TO_FIT" |
  "RESIZE_TO_FIT_WITH_IMPLICIT_SIZE";

export type StackPositioning =
  "AUTO" |
  "ABSOLUTE";

export type ConnectionType =
  "NONE" |
  "INTERNAL_NODE" |
  "URL" |
  "BACK" |
  "CLOSE" |
  "SET_VARIABLE";

export type InteractionType =
  "ON_CLICK" |
  "AFTER_TIMEOUT" |
  "MOUSE_IN" |
  "MOUSE_OUT" |
  "ON_HOVER" |
  "MOUSE_DOWN" |
  "MOUSE_UP" |
  "ON_PRESS" |
  "NONE" |
  "DRAG" |
  "ON_KEY_DOWN" |
  "ON_VOICE";

export type TransitionType =
  "INSTANT_TRANSITION" |
  "DISSOLVE" |
  "FADE" |
  "SLIDE_FROM_LEFT" |
  "SLIDE_FROM_RIGHT" |
  "SLIDE_FROM_TOP" |
  "SLIDE_FROM_BOTTOM" |
  "PUSH_FROM_LEFT" |
  "PUSH_FROM_RIGHT" |
  "PUSH_FROM_TOP" |
  "PUSH_FROM_BOTTOM" |
  "MOVE_FROM_LEFT" |
  "MOVE_FROM_RIGHT" |
  "MOVE_FROM_TOP" |
  "MOVE_FROM_BOTTOM" |
  "SLIDE_OUT_TO_LEFT" |
  "SLIDE_OUT_TO_RIGHT" |
  "SLIDE_OUT_TO_TOP" |
  "SLIDE_OUT_TO_BOTTOM" |
  "MOVE_OUT_TO_LEFT" |
  "MOVE_OUT_TO_RIGHT" |
  "MOVE_OUT_TO_TOP" |
  "MOVE_OUT_TO_BOTTOM" |
  "MAGIC_MOVE" |
  "SMART_ANIMATE" |
  "SCROLL_ANIMATE";

export type EasingType =
  "IN_CUBIC" |
  "OUT_CUBIC" |
  "INOUT_CUBIC" |
  "LINEAR" |
  "IN_BACK_CUBIC" |
  "OUT_BACK_CUBIC" |
  "INOUT_BACK_CUBIC" |
  "CUSTOM_CUBIC" |
  "SPRING" |
  "GENTLE_SPRING" |
  "CUSTOM_SPRING" |
  "SPRING_PRESET_ONE" |
  "SPRING_PRESET_TWO" |
  "SPRING_PRESET_THREE";

export type ScrollDirection =
  "NONE" |
  "HORIZONTAL" |
  "VERTICAL" |
  "BOTH";

export type ScrollContractedState =
  "EXPANDED" |
  "CONTRACTED";

export type FontVariantNumericFigure =
  "NORMAL" |
  "LINING" |
  "OLDSTYLE";

export type FontVariantNumericSpacing =
  "NORMAL" |
  "PROPORTIONAL" |
  "TABULAR";

export type FontVariantNumericFraction =
  "NORMAL" |
  "DIAGONAL" |
  "STACKED";

export type FontVariantCaps =
  "NORMAL" |
  "SMALL" |
  "ALL_SMALL" |
  "PETITE" |
  "ALL_PETITE" |
  "UNICASE" |
  "TITLING";

export type FontVariantPosition =
  "NORMAL" |
  "SUB" |
  "SUPER";

export type FontStyle =
  "NORMAL" |
  "ITALIC";

export type OpenTypeFeature =
  "PCAP" |
  "C2PC" |
  "CASE" |
  "CPSP" |
  "TITL" |
  "UNIC" |
  "ZERO" |
  "SINF" |
  "ORDN" |
  "AFRC" |
  "DNOM" |
  "NUMR" |
  "LIGA" |
  "CLIG" |
  "DLIG" |
  "HLIG" |
  "RLIG" |
  "AALT" |
  "CALT" |
  "RCLT" |
  "SALT" |
  "RVRN" |
  "VERT" |
  "SWSH" |
  "CSWH" |
  "NALT" |
  "CCMP" |
  "STCH" |
  "HIST" |
  "SIZE" |
  "ORNM" |
  "ITAL" |
  "RAND" |
  "DTLS" |
  "FLAC" |
  "MGRK" |
  "SSTY" |
  "KERN" |
  "FWID" |
  "HWID" |
  "HALT" |
  "TWID" |
  "QWID" |
  "PWID" |
  "JUST" |
  "LFBD" |
  "OPBD" |
  "RTBD" |
  "PALT" |
  "PKNA" |
  "LTRA" |
  "LTRM" |
  "RTLA" |
  "RTLM" |
  "ABRV" |
  "ABVM" |
  "ABVS" |
  "VALT" |
  "VHAL" |
  "BLWF" |
  "BLWM" |
  "BLWS" |
  "AKHN" |
  "CJCT" |
  "CFAR" |
  "CPCT" |
  "CURS" |
  "DIST" |
  "EXPT" |
  "FALT" |
  "FINA" |
  "FIN2" |
  "FIN3" |
  "HALF" |
  "HALN" |
  "HKNA" |
  "HNGL" |
  "HOJO" |
  "INIT" |
  "ISOL" |
  "JP78" |
  "JP83" |
  "JP90" |
  "JP04" |
  "LJMO" |
  "LOCL" |
  "MARK" |
  "MEDI" |
  "MED2" |
  "MKMK" |
  "NLCK" |
  "NUKT" |
  "PREF" |
  "PRES" |
  "VPAL" |
  "PSTF" |
  "PSTS" |
  "RKRF" |
  "RPHF" |
  "RUBY" |
  "SMPL" |
  "TJMO" |
  "TNAM" |
  "TRAD" |
  "VATU" |
  "VJMO" |
  "VKNA" |
  "VKRN" |
  "VRTR" |
  "VRT2" |
  "SS01" |
  "SS02" |
  "SS03" |
  "SS04" |
  "SS05" |
  "SS06" |
  "SS07" |
  "SS08" |
  "SS09" |
  "SS10" |
  "SS11" |
  "SS12" |
  "SS13" |
  "SS14" |
  "SS15" |
  "SS16" |
  "SS17" |
  "SS18" |
  "SS19" |
  "SS20" |
  "CV01" |
  "CV02" |
  "CV03" |
  "CV04" |
  "CV05" |
  "CV06" |
  "CV07" |
  "CV08" |
  "CV09" |
  "CV10" |
  "CV11" |
  "CV12" |
  "CV13" |
  "CV14" |
  "CV15" |
  "CV16" |
  "CV17" |
  "CV18" |
  "CV19" |
  "CV20" |
  "CV21" |
  "CV22" |
  "CV23" |
  "CV24" |
  "CV25" |
  "CV26" |
  "CV27" |
  "CV28" |
  "CV29" |
  "CV30" |
  "CV31" |
  "CV32" |
  "CV33" |
  "CV34" |
  "CV35" |
  "CV36" |
  "CV37" |
  "CV38" |
  "CV39" |
  "CV40" |
  "CV41" |
  "CV42" |
  "CV43" |
  "CV44" |
  "CV45" |
  "CV46" |
  "CV47" |
  "CV48" |
  "CV49" |
  "CV50" |
  "CV51" |
  "CV52" |
  "CV53" |
  "CV54" |
  "CV55" |
  "CV56" |
  "CV57" |
  "CV58" |
  "CV59" |
  "CV60" |
  "CV61" |
  "CV62" |
  "CV63" |
  "CV64" |
  "CV65" |
  "CV66" |
  "CV67" |
  "CV68" |
  "CV69" |
  "CV70" |
  "CV71" |
  "CV72" |
  "CV73" |
  "CV74" |
  "CV75" |
  "CV76" |
  "CV77" |
  "CV78" |
  "CV79" |
  "CV80" |
  "CV81" |
  "CV82" |
  "CV83" |
  "CV84" |
  "CV85" |
  "CV86" |
  "CV87" |
  "CV88" |
  "CV89" |
  "CV90" |
  "CV91" |
  "CV92" |
  "CV93" |
  "CV94" |
  "CV95" |
  "CV96" |
  "CV97" |
  "CV98" |
  "CV99";

export type PrototypeDeviceType =
  "NONE" |
  "PRESET" |
  "CUSTOM" |
  "PRESENTATION";

export type DeviceRotation =
  "NONE" |
  "CCW_90";

export type OverlayPositionType =
  "CENTER" |
  "TOP_LEFT" |
  "TOP_CENTER" |
  "TOP_RIGHT" |
  "BOTTOM_LEFT" |
  "BOTTOM_CENTER" |
  "BOTTOM_RIGHT" |
  "MANUAL";

export type OverlayBackgroundInteraction =
  "NONE" |
  "CLOSE_ON_CLICK_OUTSIDE";

export type OverlayBackgroundType =
  "NONE" |
  "SOLID_COLOR";

export type NavigationType =
  "NAVIGATE" |
  "OVERLAY" |
  "SWAP" |
  "SWAP_STATE" |
  "SCROLL_TO";

export type ExportSVGIDMode =
  "IF_NEEDED" |
  "ALWAYS";

export type StyleType =
  "NONE" |
  "FILL" |
  "STROKE" |
  "TEXT" |
  "EFFECT" |
  "EXPORT" |
  "GRID";

export type ScrollBehavior =
  "SCROLLS" |
  "FIXED_WHEN_CHILD_OF_SCROLLING_FRAME";

export type ConnectorMagnet =
  "NONE" |
  "AUTO" |
  "TOP" |
  "LEFT" |
  "BOTTOM" |
  "RIGHT";

export type ConnectorTextSection =
  "MIDDLE_TO_START" |
  "MIDDLE_TO_END";

export type ConnectorLineStyle =
  "ELBOWED" |
  "STRAIGHT";

export type EditorType =
  "DESIGN" |
  "WHITEBOARD";

export type ComponentPropNodeField =
  "VISIBLE" |
  "TEXT_DATA" |
  "OVERRIDDEN_SYMBOL_ID" |
  "INHERIT_FILL_STYLE_ID";

export type ComponentPropType =
  "BOOL" |
  "TEXT" |
  "COLOR" |
  "INSTANCE_SWAP";

export type WidgetEvent =
  "MOUSE_DOWN" |
  "CLICK" |
  "TEXT_EDIT_END" |
  "ATTACHED_STICKABLES_CHANGED" |
  "STUCK_STATUS_CHANGED";

export type WidgetInputBehavior =
  "WRAP" |
  "TRUNCATE" |
  "MULTILINE";

export type WidgetPropertyMenuItemType =
  "ACTION" |
  "SEPARATOR" |
  "COLOR" |
  "DROPDOWN" |
  "COLOR_SELECTOR" |
  "TOGGLE" |
  "LINK";

export type CodeBlockLanguage =
  "TYPESCRIPT" |
  "CPP" |
  "RUBY" |
  "CSS" |
  "JAVASCRIPT" |
  "HTML" |
  "JSON" |
  "GRAPHQL" |
  "PYTHON" |
  "GO" |
  "SQL" |
  "SWIFT" |
  "KOTLIN" |
  "RUST";

export type InternalEnumForTest =
  "OLD";

export type BulletType =
  "ORDERED" |
  "UNORDERED" |
  "INDENT" |
  "NO_LIST";

export type LineType =
  "PLAIN" |
  "ORDERED_LIST" |
  "UNORDERED_LIST";

export type Directionality =
  "LTR" |
  "RTL";

export type DirectionalityIntent =
  "IMPLICIT" |
  "EXPLICIT";

export type TriggerDevice =
  "KEYBOARD" |
  "UNKNOWN_CONTROLLER" |
  "XBOX_ONE" |
  "PS4" |
  "SWITCH_PRO";

export type TransitionDirection =
  "FORWARD" |
  "REVERSE";

export type PlaybackChangePhase =
  "INITIATED" |
  "ABORTED" |
  "COMMITTED";

export type RichMediaType =
  "ANIMATED_IMAGE";

export type VariableDataType =
  "BOOLEAN" |
  "FLOAT" |
  "STRING";

export type HTMLTag =
  "AUTO" |
  "ARTICLE" |
  "SECTION" |
  "NAV" |
  "ASIDE" |
  "H1" |
  "H2" |
  "H3" |
  "H4" |
  "H5" |
  "H6" |
  "HGROUP" |
  "HEADER" |
  "FOOTER" |
  "ADDRESS" |
  "P" |
  "HR" |
  "PRE" |
  "BLOCKQUOTE" |
  "OL" |
  "UL" |
  "MENU" |
  "LI" |
  "DL" |
  "DT" |
  "DD" |
  "FIGURE" |
  "FIGCAPTION" |
  "MAIN" |
  "DIV" |
  "A" |
  "EM" |
  "STRONG" |
  "SMALL" |
  "S" |
  "CITE" |
  "Q" |
  "DFN" |
  "ABBR" |
  "RUBY" |
  "RT" |
  "RP" |
  "DATA" |
  "TIME" |
  "CODE" |
  "VAR" |
  "SAMP" |
  "KBD" |
  "SUB" |
  "SUP" |
  "I" |
  "B" |
  "U" |
  "MARK" |
  "BDI" |
  "BDO" |
  "SPAN" |
  "BR" |
  "WBR" |
  "PICTURE" |
  "SOURCE" |
  "IMG" |
  "FORM" |
  "LABEL" |
  "INPUT" |
  "BUTTON" |
  "SELECT" |
  "DATALIST" |
  "OPTGROUP" |
  "OPTION" |
  "TEXTAREA" |
  "OUTPUT" |
  "PROGRESS" |
  "METER" |
  "FIELDSET" |
  "LEGEND";

export type ARIARole =
  "AUTO" |
  "BUTTON" |
  "CHECKBOX" |
  "GRIDCELL" |
  "LINK" |
  "MENUITEM" |
  "MENUITEMCHECKBOX" |
  "MENUITEMRADIO" |
  "OPTION" |
  "PROGRESSBAR" |
  "RADIO" |
  "SCROLLBAR" |
  "SEARCHBOX" |
  "SEPARATOR" |
  "SLIDER" |
  "SPINBUTTON" |
  "SWITCH" |
  "TAB" |
  "TABPANEL" |
  "TEXTBOX" |
  "TREEITEM" |
  "COMBOBOX" |
  "GRID" |
  "LISTBOX" |
  "MENU" |
  "MENUBAR" |
  "RADIOGROUP" |
  "TABLIST" |
  "TREE" |
  "TREEGRID" |
  "APPLICATION" |
  "ARTICLE" |
  "BLOCKQUOTE" |
  "CAPTION" |
  "CELL" |
  "COLUMNHEADER" |
  "DEFINITION" |
  "DELETION" |
  "DIRECTORY" |
  "DOCUMENT" |
  "EMPHASIS" |
  "FEED" |
  "FIGURE" |
  "GENERIC" |
  "GROUP" |
  "HEADING" |
  "IMG" |
  "INSERTION" |
  "LIST" |
  "LISTITEM" |
  "MATH" |
  "METER" |
  "NONE" |
  "NOTE" |
  "PARAGRAPH" |
  "PRESENTATION" |
  "ROW" |
  "ROWGROUP" |
  "ROWHEADER" |
  "STRONG" |
  "SUBSCRIPT" |
  "SUPERSCRIPT" |
  "TABLE" |
  "TERM" |
  "TIME" |
  "TOOLBAR" |
  "TOOLTIP" |
  "BANNER" |
  "COMPLEMENTARY" |
  "CONTENTINFO" |
  "FORM" |
  "MAIN" |
  "NAVIGATION" |
  "REGION" |
  "SEARCH" |
  "ALERT" |
  "LOG" |
  "MARQUEE" |
  "STATUS" |
  "TIMER" |
  "ALERTDIALOG" |
  "DIALOG";

export interface GUID {
  sessionID: number;
  localID: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ColorStop {
  color: Color;
  position: number;
}

export interface Matrix {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
}

export interface ParentIndex {
  guid: GUID;
  position: string;
}

export interface Number {
  value: number;
  units: NumberUnits;
}

export interface FontName {
  family: string;
  style: string;
  postscript: string;
}

export interface ExportConstraint {
  type: ExportConstraintType;
  value: number;
}

export interface GUIDMapping {
  from: GUID;
  to: GUID;
}

export interface Blob {
  bytes: Uint8Array;
}

export interface Image {
  hash?: Uint8Array;
  name?: string;
  dataBlob?: number;
}

export interface Video {
  hash?: Uint8Array;
  s3Url?: string;
}

export interface FilterColorAdjust {
  tint: number;
  shadows: number;
  highlights: number;
  detail: number;
  exposure: number;
  vignette: number;
  temperature: number;
  vibrance: number;
}

export interface PaintFilterMessage {
  tint?: number;
  shadows?: number;
  highlights?: number;
  detail?: number;
  exposure?: number;
  vignette?: number;
  temperature?: number;
  vibrance?: number;
  contrast?: number;
  brightness?: number;
}

export interface Paint {
  type?: PaintType;
  color?: Color;
  opacity?: number;
  visible?: boolean;
  blendMode?: BlendMode;
  stops?: ColorStop[];
  transform?: Matrix;
  image?: Image;
  imageThumbnail?: Image;
  animatedImage?: Image;
  animationFrame?: number;
  imageScaleMode?: ImageScaleMode;
  rotation?: number;
  scale?: number;
  filterColorAdjust?: FilterColorAdjust;
  paintFilter?: PaintFilterMessage;
  emojiCodePoints?: number[];
  video?: Video;
  originalImageWidth?: number;
  originalImageHeight?: number;
}

export interface FontMetaData {
  key?: FontName;
  fontLineHeight?: number;
  fontDigest?: Uint8Array;
  fontStyle?: FontStyle;
  fontWeight?: number;
}

export interface FontVariation {
  axisTag?: number;
  axisName?: string;
  value?: number;
}

export interface TextData {
  characters?: string;
  characterStyleIDs?: number[];
  styleOverrideTable?: NodeChange[];
  layoutSize?: Vector;
  baselines?: Baseline[];
  glyphs?: Glyph[];
  decorations?: Decoration[];
  layoutVersion?: number;
  fontMetaData?: FontMetaData[];
  fallbackFonts?: FontName[];
  hyperlinkBoxes?: HyperlinkBox[];
  lines?: TextLineData[];
  truncationStartIndex?: number;
  truncatedHeight?: number;
}

export interface HyperlinkBox {
  bounds?: Rect;
  url?: string;
  guid?: GUID;
  hyperlinkID?: number;
}

export interface Baseline {
  position?: Vector;
  width?: number;
  lineY?: number;
  lineHeight?: number;
  lineAscent?: number;
  firstCharacter?: number;
  endCharacter?: number;
}

export interface Glyph {
  commandsBlob?: number;
  position?: Vector;
  styleID?: number;
  fontSize?: number;
  firstCharacter?: number;
  advance?: number;
}

export interface Decoration {
  rects?: Rect[];
  styleID?: number;
}

export interface VectorData {
  vectorNetworkBlob?: number;
  normalizedSize?: Vector;
  styleOverrideTable?: NodeChange[];
}

export interface GUIDPath {
  guids?: GUID[];
}

export interface SymbolData {
  symbolID?: GUID;
  symbolOverrides?: NodeChange[];
  uniformScaleFactor?: number;
}

export interface GUIDPathMapping {
  id?: GUID;
  path?: GUIDPath;
}

export interface NodeGenerationData {
  overrides?: NodeChange[];
}

export interface DerivedImmutableFrameData {
  overrides?: NodeChange[];
  version?: number;
}

export interface SharedSymbolReference {
  fileKey?: string;
  symbolID?: GUID;
  versionHash?: string;
  guidPathMappings?: GUIDPathMapping[];
  bytes?: Uint8Array;
  libraryGUIDToSubscribingGUID?: GUIDMapping[];
  componentKey?: string;
  unflatteningMappings?: GUIDPathMapping[];
  isUnflattened?: boolean;
}

export interface SharedComponentMasterData {
  componentKey?: string;
  publishingGUIDPathToTeamLibraryGUID?: GUIDPathMapping[];
  isUnflattened?: boolean;
}

export interface InstanceOverrideStash {
  overridePathOfSwappedInstance?: GUIDPath;
  componentKey?: string;
  overrides?: NodeChange[];
}

export interface InstanceOverrideStashV2 {
  overridePathOfSwappedInstance?: GUIDPath;
  localSymbolID?: GUID;
  overrides?: NodeChange[];
}

export interface Effect {
  type?: EffectType;
  color?: Color;
  offset?: Vector;
  radius?: number;
  visible?: boolean;
  blendMode?: BlendMode;
  spread?: number;
  showShadowBehindNode?: boolean;
}

export interface TransitionInfo {
  type?: TransitionType;
  duration?: number;
}

export interface PrototypeDevice {
  type?: PrototypeDeviceType;
  size?: Vector;
  presetIdentifier?: string;
  rotation?: DeviceRotation;
}

export interface OverlayBackgroundAppearance {
  backgroundType?: OverlayBackgroundType;
  backgroundColor?: Color;
}

export interface ExportSettings {
  suffix?: string;
  imageType?: ImageType;
  constraint?: ExportConstraint;
  svgDataName?: boolean;
  svgIDMode?: ExportSVGIDMode;
  svgOutlineText?: boolean;
  contentsOnly?: boolean;
  svgForceStrokeMasks?: boolean;
  useAbsoluteBounds?: boolean;
}

export interface LayoutGrid {
  type?: LayoutGridType;
  axis?: Axis;
  visible?: boolean;
  numSections?: number;
  offset?: number;
  sectionSize?: number;
  gutterSize?: number;
  color?: Color;
  pattern?: LayoutGridPattern;
}

export interface Guide {
  axis?: Axis;
  offset?: number;
  guid?: GUID;
}

export interface Path {
  windingRule?: WindingRule;
  commandsBlob?: number;
  styleID?: number;
}

export interface SharedStyleReference {
  styleKey?: string;
  versionHash?: string;
}

export interface SharedStyleMasterData {
  styleKey?: string;
  sortPosition?: string;
  fileKey?: string;
}

export interface ArcData {
  startingAngle?: number;
  endingAngle?: number;
  innerRadius?: number;
}

export interface SymbolLink {
  uri?: string;
  displayName?: string;
  displayText?: string;
}

export interface PluginData {
  pluginID?: string;
  value?: string;
  key?: string;
}

export interface PluginRelaunchData {
  pluginID?: string;
  message?: string;
  command?: string;
  isDeleted?: boolean;
}

export interface ConnectorEndpoint {
  endpointNodeID?: GUID;
  position?: Vector;
  magnet?: ConnectorMagnet;
}

export interface ConnectorControlPoint {
  position?: Vector;
  axis?: Vector;
}

export interface ConnectorTextMidpoint {
  section?: ConnectorTextSection;
  offset?: number;
}

export interface LibraryMoveInfo {
  oldKey?: string;
  pasteFileKey?: string;
}

export interface LibraryMoveHistoryItem {
  sourceNodeId?: GUID;
  sourceComponentKey?: string;
}

export interface WidgetPointer {
  nodeId?: GUID;
}

export interface NodeChange {
  guid?: GUID;
  guidTag?: number;
  phase?: NodePhase;
  phaseTag?: number;
  parentIndex?: ParentIndex;
  parentIndexTag?: number;
  type?: NodeType;
  typeTag?: number;
  name?: string;
  nameTag?: number;
  visible?: boolean;
  visibleTag?: number;
  locked?: boolean;
  lockedTag?: number;
  opacity?: number;
  opacityTag?: number;
  blendMode?: BlendMode;
  blendModeTag?: number;
  count?: number;
  countTag?: number;
  size?: Vector;
  sizeTag?: number;
  transform?: Matrix;
  transformTag?: number;
  dashPattern?: number[];
  dashPatternTag?: number;
  autoRename?: boolean;
  autoRenameTag?: number;
  backgroundEnabled?: boolean;
  backgroundEnabledTag?: number;
  mask?: boolean;
  maskTag?: number;
  exportContentsOnly?: boolean;
  exportContentsOnlyTag?: number;
  maskIsOutline?: boolean;
  maskIsOutlineTag?: number;
  backgroundOpacity?: number;
  backgroundOpacityTag?: number;
  cornerRadius?: number;
  cornerRadiusTag?: number;
  fontSize?: number;
  fontSizeTag?: number;
  paragraphIndent?: number;
  paragraphIndentTag?: number;
  paragraphSpacing?: number;
  paragraphSpacingTag?: number;
  starInnerScale?: number;
  starInnerScaleTag?: number;
  miterLimit?: number;
  miterLimitTag?: number;
  strokeWeight?: number;
  strokeWeightTag?: number;
  textTracking?: number;
  textTrackingTag?: number;
  horizontalConstraint?: ConstraintType;
  horizontalConstraintTag?: number;
  strokeAlign?: StrokeAlign;
  strokeAlignTag?: number;
  strokeCap?: StrokeCap;
  strokeCapTag?: number;
  strokeJoin?: StrokeJoin;
  strokeJoinTag?: number;
  textAlignHorizontal?: TextAlignHorizontal;
  textAlignHorizontalTag?: number;
  textAlignVertical?: TextAlignVertical;
  textAlignVerticalTag?: number;
  textCase?: TextCase;
  textCaseTag?: number;
  textDecoration?: TextDecoration;
  textDecorationTag?: number;
  booleanOperation?: BooleanOperation;
  booleanOperationTag?: number;
  verticalConstraint?: ConstraintType;
  verticalConstraintTag?: number;
  fillPaints?: Paint[];
  fillPaintsTag?: number;
  strokePaints?: Paint[];
  strokePaintsTag?: number;
  lineHeight?: Number;
  lineHeightTag?: number;
  fontName?: FontName;
  fontNameTag?: number;
  textData?: TextData;
  textDataTag?: number;
  effects?: Effect[];
  effectsTag?: number;
  handleMirroring?: VectorMirror;
  handleMirroringTag?: number;
  exportSettings?: ExportSettings[];
  exportSettingsTag?: number;
  textAutoResize?: TextAutoResize;
  textAutoResizeTag?: number;
  layoutGrids?: LayoutGrid[];
  layoutGridsTag?: number;
  vectorData?: VectorData;
  vectorDataTag?: number;
  styleID?: number;
  styleIDTag?: number;
  backgroundColor?: Color;
  backgroundColorTag?: number;
  fillGeometry?: Path[];
  fillGeometryTag?: number;
  strokeGeometry?: Path[];
  strokeGeometryTag?: number;
  stackMode?: StackMode;
  stackModeTag?: number;
  stackSpacing?: number;
  stackSpacingTag?: number;
  stackPadding?: number;
  stackPaddingTag?: number;
  guidPath?: GUIDPath;
  guidPathTag?: number;
  symbolData?: SymbolData;
  symbolDataTag?: number;
  frameMaskDisabled?: boolean;
  frameMaskDisabledTag?: number;
  resizeToFit?: boolean;
  resizeToFitTag?: number;
  exportBackgroundDisabled?: boolean;
  stackCounterAlign?: StackCounterAlign;
  stackJustify?: StackJustify;
  sharedSymbolReference?: SharedSymbolReference;
  isSymbolPublishable?: boolean;
  sharedSymbolMappings?: GUIDPathMapping[];
  derivedSymbolData?: NodeChange[];
  sharedSymbolVersion?: string;
  fontVariantCommonLigatures?: boolean;
  fontVariantContextualLigatures?: boolean;
  fontVariantDiscretionaryLigatures?: boolean;
  fontVariantHistoricalLigatures?: boolean;
  fontVariantOrdinal?: boolean;
  fontVariantSlashedZero?: boolean;
  fontVariantNumericFigure?: FontVariantNumericFigure;
  fontVariantNumericSpacing?: FontVariantNumericSpacing;
  fontVariantNumericFraction?: FontVariantNumericFraction;
  fontVariantCaps?: FontVariantCaps;
  fontVariantPosition?: FontVariantPosition;
  guides?: Guide[];
  transitionNodeID?: GUID;
  prototypeStartNodeID?: GUID;
  prototypeBackgroundColor?: Color;
  internalOnly?: boolean;
  overriddenSymbolID?: GUID;
  symbolDescription?: string;
  rectangleTopLeftCornerRadius?: number;
  rectangleTopRightCornerRadius?: number;
  rectangleBottomLeftCornerRadius?: number;
  rectangleBottomRightCornerRadius?: number;
  rectangleCornerRadiiIndependent?: boolean;
  rectangleCornerToolIndependent?: boolean;
  proportionsConstrained?: boolean;
  sharedComponentMasterData?: SharedComponentMasterData;
  transitionInfo?: TransitionInfo;
  transitionType?: TransitionType;
  transitionDuration?: number;
  easingType?: EasingType;
  scrollDirection?: ScrollDirection;
  cornerSmoothing?: number;
  inheritFillStyleID?: GUID;
  inheritStrokeStyleID?: GUID;
  inheritTextStyleID?: GUID;
  inheritExportStyleID?: GUID;
  inheritEffectStyleID?: GUID;
  inheritGridStyleID?: GUID;
  inheritFillStyleIDForStroke?: GUID;
  isFillStyle?: boolean;
  isStrokeStyle?: boolean;
  styleType?: StyleType;
  styleDescription?: string;
  unflatteningMappings?: GUIDPathMapping[];
  letterSpacing?: Number;
  scrollOffset?: Vector;
  version?: string;
  sharedStyleMasterData?: SharedStyleMasterData;
  sharedStyleReference?: SharedStyleReference;
  isPublishable?: boolean;
  exportTextAsSVGText?: boolean;
  isSoftDeletedStyle?: boolean;
  isNonUpdateable?: boolean;
  scrollContractedState?: ScrollContractedState;
  contractedSize?: Vector;
  fixedChildrenDivider?: string;
  transitionPreserveScroll?: boolean;
  connectionType?: ConnectionType;
  connectionURL?: string;
  prototypeDevice?: PrototypeDevice;
  scrollBehavior?: ScrollBehavior;
  interactionType?: InteractionType;
  transitionTimeout?: number;
  interactionMaintained?: boolean;
  interactionDuration?: number;
  destinationIsOverlay?: boolean;
  backgroundPaints?: Paint[];
  inheritFillStyleIDForBackground?: GUID;
  arcData?: ArcData;
  derivedSymbolDataLayoutVersion?: number;
  navigationType?: NavigationType;
  overlayPositionType?: OverlayPositionType;
  overlayRelativePosition?: Vector;
  overlayBackgroundInteraction?: OverlayBackgroundInteraction;
  overlayBackgroundAppearance?: OverlayBackgroundAppearance;
  fontVersion?: string;
  textUserLayoutVersion?: number;
  pluginData?: PluginData[];
  toggledOnOTFeatures?: OpenTypeFeature[];
  toggledOffOTFeatures?: OpenTypeFeature[];
  transitionShouldSmartAnimate?: boolean;
  stackAlign?: StackAlign;
  stackHorizontalPadding?: number;
  stackVerticalPadding?: number;
  stackWidth?: StackSize;
  stackHeight?: StackSize;
  overrideKey?: GUID;
  publishFile?: string;
  publishID?: GUID;
  componentKey?: string;
  isC2?: boolean;
  publishedVersion?: string;
  pluginRelaunchData?: PluginRelaunchData[];
  containerSupportsFillStrokeAndCorners?: boolean;
  stackCounterSizing?: StackSize;
  containersSupportFillStrokeAndCorners?: boolean;
  hyperlink?: Hyperlink;
  keyTrigger?: KeyTrigger;
  isStateGroup?: boolean;
  prototypeInteractions?: PrototypeInteraction[];
  voiceEventPhrase?: string;
  forceUnflatteningMappings?: GUIDPathMapping[];
  stackPrimarySizing?: StackSize;
  stackPrimaryAlignItems?: StackJustify;
  stackCounterAlignItems?: StackAlign;
  stackChildPrimaryGrow?: number;
  stackPaddingRight?: number;
  stackPaddingBottom?: number;
  ancestorPathBeforeDeletion?: GUID[];
  stackChildAlignSelf?: StackCounterAlign;
  symbolLinks?: SymbolLink[];
  stateGroupPropertyValueOrders?: StateGroupPropertyValueOrder[];
  textListData?: TextListData;
  nodeGenerationData?: NodeGenerationData;
  shapeWithTextType?: ShapeWithTextType;
  connectorStart?: ConnectorEndpoint;
  connectorEnd?: ConnectorEndpoint;
  connectorLineStyle?: ConnectorLineStyle;
  connectorStartCap?: StrokeCap;
  connectorEndCap?: StrokeCap;
  shapeUserHeight?: number;
  overrideStash?: InstanceOverrideStash[];
  prototypeStartingPoint?: PrototypeStartingPoint;
  overrideStashV2?: InstanceOverrideStashV2[];
  internalEnumForTest?: InternalEnumForTest;
  originComponentKey?: string;
  connectorControlPoints?: ConnectorControlPoint[];
  derivedImmutableFrameData?: DerivedImmutableFrameData;
  connectorTextMidpoint?: ConnectorTextMidpoint;
  libraryMoveInfo?: LibraryMoveInfo;
  internalDataForTest?: InternalDataForTest;
  useAbsoluteBounds?: boolean;
  codeBlockLanguage?: CodeBlockLanguage;
  fontVariations?: FontVariation[];
  detachOpticalSizeFromFontSize?: boolean;
  widgetMetadata?: WidgetMetadata;
  widgetEvents?: WidgetEvent[];
  listSpacing?: number;
  widgetPropertyMenuItems?: WidgetPropertyMenuItem[];
  componentPropDefs?: ComponentPropDef[];
  componentPropRefs?: ComponentPropRef[];
  componentPropAssignments?: ComponentPropAssignment[];
  stackPositioning?: StackPositioning;
  embedData?: EmbedData;
  stackReverseZIndex?: boolean;
  richMediaData?: RichMediaData;
  widgetSyncedState?: MultiplayerMap;
  widgetSyncCursor?: number;
  widgetDerivedSubtreeCursor?: WidgetDerivedSubtreeCursor;
  widgetCachedAncestor?: WidgetPointer;
  renderedSyncedState?: MultiplayerMap;
  linkPreviewData?: LinkPreviewData;
  textBidiVersion?: number;
  textTruncation?: TextTruncation;
  libraryMoveHistory?: LibraryMoveHistoryItem[];
  shapeTruncates?: boolean;
  sectionContentsHidden?: boolean;
  simplifyInstancePanels?: boolean;
  widgetInputBehavior?: WidgetInputBehavior;
  widgetTooltip?: string;
  borderTopHidden?: boolean;
  borderBottomHidden?: boolean;
  borderLeftHidden?: boolean;
  borderRightHidden?: boolean;
  widgetHoverStyle?: WidgetHoverStyle;
  hasHadRTLText?: boolean;
  isWidgetStickable?: boolean;
  bordersTakeSpace?: boolean;
  borderTopWeight?: number;
  borderBottomWeight?: number;
  borderLeftWeight?: number;
  borderRightWeight?: number;
  borderStrokeWeightsIndependent?: boolean;
  videoPlayback?: VideoPlayback;
  stampData?: StampData;
  htmlTag?: HTMLTag;
  ariaRole?: ARIARole;
  accessibleLabel?: string;
  propsAreBubbled?: boolean;
  variableData?: VariableData;
}

export interface VideoPlayback {
  autoplay?: boolean;
  mediaLoop?: boolean;
  muted?: boolean;
}

export interface WidgetHoverStyle {
  fillPaints?: Paint[];
  strokePaints?: Paint[];
  opacity?: number;
  areFillPaintsSet?: boolean;
  areStrokePaintsSet?: boolean;
  isOpacitySet?: boolean;
}

export interface WidgetDerivedSubtreeCursor {
  sessionID?: number;
  counter?: number;
}

export interface MultiplayerMap {
  entries?: MultiplayerMapEntry[];
}

export interface MultiplayerMapEntry {
  key?: string;
  value?: string;
}

export interface ComponentPropRef {
  nodeField?: number;
  defID?: GUID;
  zombieFallbackName?: string;
  componentPropNodeField?: ComponentPropNodeField;
  isDeleted?: boolean;
}

export interface ComponentPropAssignment {
  defID?: GUID;
  value?: ComponentPropValue;
}

export interface ComponentPropDef {
  id?: GUID;
  name?: string;
  initialValue?: ComponentPropValue;
  sortPosition?: string;
  parentPropDefId?: GUID;
  type?: ComponentPropType;
  isDeleted?: boolean;
  preferredValues?: ComponentPropPreferredValues;
}

export interface ComponentPropValue {
  boolValue?: boolean;
  textValue?: TextData;
  guidValue?: GUID;
}

export interface ComponentPropPreferredValues {
  stringValues?: string[];
}

export interface WidgetMetadata {
  pluginID?: string;
  pluginVersionID?: string;
  widgetName?: string;
}

export interface WidgetPropertyMenuSelectorOption {
  option?: string;
  tooltip?: string;
}

export interface WidgetPropertyMenuItem {
  propertyName?: string;
  tooltip?: string;
  itemType?: WidgetPropertyMenuItemType;
  icon?: string;
  options?: WidgetPropertyMenuSelectorOption[];
  selectedOption?: string;
  isToggled?: boolean;
  href?: string;
}

export interface InternalDataForTest {
  testFieldA?: number;
}

export interface StateGroupPropertyValueOrder {
  property?: string;
  values?: string[];
}

export interface TextListData {
  listID?: number;
  bulletType?: BulletType;
  indentationLevel?: number;
  lineNumber?: number;
}

export interface TextLineData {
  lineType?: LineType;
  indentationLevel?: number;
  directionality?: Directionality;
  directionalityIntent?: DirectionalityIntent;
}

export interface PrototypeInteraction {
  id?: GUID;
  event?: PrototypeEvent;
  actions?: PrototypeAction[];
  isDeleted?: boolean;
}

export interface PrototypeEvent {
  interactionType?: InteractionType;
  interactionMaintained?: boolean;
  interactionDuration?: number;
  keyTrigger?: KeyTrigger;
  voiceEventPhrase?: string;
  transitionTimeout?: number;
}

export interface PrototypeAction {
  transitionNodeID?: GUID;
  transitionType?: TransitionType;
  transitionDuration?: number;
  easingType?: EasingType;
  transitionTimeout?: number;
  transitionShouldSmartAnimate?: boolean;
  connectionType?: ConnectionType;
  connectionURL?: string;
  overlayRelativePosition?: Vector;
  navigationType?: NavigationType;
  transitionPreserveScroll?: boolean;
  easingFunction?: number[];
  extraScrollOffset?: Vector;
  targetVariableID?: GUID;
}

export interface PrototypeStartingPoint {
  name?: string;
  description?: string;
  position?: string;
}

export interface KeyTrigger {
  keyCodes?: number[];
  triggerDevice?: TriggerDevice;
}

export interface Hyperlink {
  url?: string;
  guid?: GUID;
}

export interface EmbedData {
  url?: string;
  srcUrl?: string;
  title?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  embedType?: string;
  thumbnailImageHash?: string;
  faviconImageHash?: string;
  provider?: string;
  originalText?: string;
  description?: string;
}

export interface StampData {
  userId?: string;
}

export interface LinkPreviewData {
  url?: string;
  title?: string;
  provider?: string;
  description?: string;
  thumbnailImageHash?: string;
  faviconImageHash?: string;
  thumbnailImageWidth?: number;
  thumbnailImageHeight?: number;
}

export interface Viewport {
  canvasSpaceBounds?: Rect;
  pixelPreview?: boolean;
  pixelDensity?: number;
  canvasGuid?: GUID;
}

export interface Mouse {
  cursor?: MouseCursor;
  canvasSpaceLocation?: Vector;
  canvasSpaceSelectionBox?: Rect;
  canvasGuid?: GUID;
}

export interface Click {
  id: number;
  point: Vector;
}

export interface ScrollPosition {
  node: GUID;
  scrollOffset: Vector;
}

export interface TriggeredOverlay {
  overlayGuid: GUID;
  hotspotGuid: GUID;
  swapGuid: GUID;
}

export interface TriggeredOverlayData {
  overlayGuid?: GUID;
  hotspotGuid?: GUID;
  swapGuid?: GUID;
  prototypeInteractionGuid?: GUID;
  hotspotBlueprintId?: GUIDPath;
}

export interface PresentedState {
  baseScreenID?: GUID;
  overlays?: TriggeredOverlayData[];
}

export interface TopLevelPlaybackChange {
  oldState?: PresentedState;
  newState?: PresentedState;
  hotspotBlueprintID?: GUIDPath;
  interactionID?: GUID;
  isHotspotInNewPresentedState?: boolean;
  direction?: TransitionDirection;
  instanceStablePath?: GUIDPath;
}

export interface InstanceStateChange {
  stateID?: GUID;
  interactionID?: GUID;
  hotspotStablePath?: GUIDPath;
  instanceStablePath?: GUIDPath;
  phase?: PlaybackChangePhase;
}

export interface PlaybackChangeKeyframe {
  phase?: PlaybackChangePhase;
  progress?: number;
  timestamp?: number;
}

export interface StateMapping {
  stablePath?: GUIDPath;
  lastTopLevelChange?: TopLevelPlaybackChange;
  lastTopLevelChangeStatus?: PlaybackChangeKeyframe;
  timestamp?: number;
}

export interface ScrollMapping {
  blueprintID?: GUIDPath;
  overlayIndex?: number;
  scrollOffset?: Vector;
}

export interface PlaybackUpdate {
  lastTopLevelChange?: TopLevelPlaybackChange;
  lastTopLevelChangeStatus?: PlaybackChangeKeyframe;
  scrollMappings?: ScrollMapping[];
  timestamp?: number;
  pointerLocation?: Vector;
  isTopLevelFrameChange?: boolean;
  stateMappings?: StateMapping[];
}

export interface ChatMessage {
  text?: string;
  previousText?: string;
}

export interface VoiceMetadata {
  connectedCallId?: string;
}

export interface UserChange {
  sessionID?: number;
  connected?: boolean;
  name?: string;
  color?: Color;
  imageURL?: string;
  viewport?: Viewport;
  mouse?: Mouse;
  selection?: GUID[];
  observing?: number[];
  deviceName?: string;
  recentClicks?: Click[];
  scrollPositions?: ScrollPosition[];
  triggeredOverlays?: TriggeredOverlay[];
  userID?: string;
  lastTriggeredHotspot?: GUID;
  lastTriggeredPrototypeInteractionID?: GUID;
  triggeredOverlaysData?: TriggeredOverlayData[];
  playbackUpdates?: PlaybackUpdate[];
  chatMessage?: ChatMessage;
  voiceMetadata?: VoiceMetadata;
  canWrite?: boolean;
  highFiveStatus?: boolean;
  instanceStateChanges?: InstanceStateChange[];
}

export interface SceneGraphQuery {
  startingNode?: GUID;
  depth?: number;
}

export interface NodeChangesMetadata {
  blobsFieldOffset?: number;
}

export interface CursorReaction {
  imageUrl?: string;
}

export interface TimerInfo {
  isPaused?: boolean;
  timeRemainingMs?: number;
  totalTimeMs?: number;
  timerID?: number;
  setBy?: string;
}

export interface PresenterInfo {
  sessionID?: number;
}

export interface ClientBroadcast {
  sessionID?: number;
  cursorReaction?: CursorReaction;
  timer?: TimerInfo;
  presenter?: PresenterInfo;
}

export interface Message {
  type?: MessageType;
  sessionID?: number;
  ackID?: number;
  nodeChanges?: NodeChange[];
  userChanges?: UserChange[];
  blobs?: Blob[];
  signalName?: string;
  access?: Access;
  styleSetName?: string;
  styleSetType?: StyleSetType;
  styleSetContentType?: StyleSetContentType;
  pasteID?: number;
  pasteOffset?: Vector;
  pasteFileKey?: string;
  signalPayload?: string;
  sceneGraphQueries?: SceneGraphQuery[];
  nodeChangesMetadata?: NodeChangesMetadata;
  fileVersion?: number;
  pasteIsPartiallyOutsideEnclosingFrame?: boolean;
  pastePageId?: GUID;
  isCut?: boolean;
  localUndoStack?: Message[];
  localRedoStack?: Message[];
  broadcasts?: ClientBroadcast[];
  reconnectSequenceNumber?: number;
  pasteBranchSourceFileKey?: string;
  pasteEditorType?: EditorType;
}

export interface DiffChunk {
  nodeChanges?: number[];
  phase?: NodePhase;
  displayNode?: NodeChange;
  canvasId?: GUID;
  canvasName?: string;
  canvasIsInternal?: boolean;
  chunksAffectingThisChunk?: number[];
  basisParentHierarchy?: NodeChange[];
  parentHierarchy?: NodeChange[];
}

export interface DiffPayload {
  nodeChanges?: NodeChange[];
  blobs?: Blob[];
  diffChunks?: DiffChunk[];
  diffBasis?: NodeChange[];
}

export interface RichMediaData {
  mediaHash?: string;
  richMediaType?: RichMediaType;
}

export interface VariableAnyValue {
  boolValue?: boolean;
  textValue?: string;
  floatValue?: number;
}

export interface VariableData {
  value?: VariableAnyValue;
  dataType?: VariableDataType;
}

export interface SparseMessage {
  type?: MessageType;
  sessionID?: number;
  ackID?: number;
  nodeChanges?: SparseNodeChange[];
  userChanges?: UserChange[];
  blobs?: Blob[];
  signalName?: string;
  access?: Access;
  styleSetName?: string;
  styleSetType?: StyleSetType;
  styleSetContentType?: StyleSetContentType;
  pasteID?: number;
  pasteOffset?: Vector;
  pasteFileKey?: string;
  signalPayload?: string;
  sceneGraphQueries?: SceneGraphQuery[];
  nodeChangesMetadata?: NodeChangesMetadata;
  fileVersion?: number;
  pasteIsPartiallyOutsideEnclosingFrame?: boolean;
  pastePageId?: GUID;
  isCut?: boolean;
  localUndoStack?: Message[];
  localRedoStack?: Message[];
  broadcasts?: ClientBroadcast[];
  reconnectSequenceNumber?: number;
  pasteBranchSourceFileKey?: string;
  pasteEditorType?: EditorType;
}

export interface SparseNodeChange {
  guid?: GUID;
  guidTag?: number;
  phase?: NodePhase;
  phaseTag?: number;
  parentIndex?: ParentIndex;
  parentIndexTag?: number;
  type?: NodeType;
  typeTag?: number;
  name?: string;
  nameTag?: number;
  visible?: boolean;
  visibleTag?: number;
  locked?: boolean;
  lockedTag?: number;
  opacity?: number;
  opacityTag?: number;
  blendMode?: BlendMode;
  blendModeTag?: number;
  count?: number;
  countTag?: number;
  size?: Vector;
  sizeTag?: number;
  transform?: Matrix;
  transformTag?: number;
  dashPattern?: number[];
  dashPatternTag?: number;
  autoRename?: boolean;
  autoRenameTag?: number;
  backgroundEnabled?: boolean;
  backgroundEnabledTag?: number;
  mask?: boolean;
  maskTag?: number;
  exportContentsOnly?: boolean;
  exportContentsOnlyTag?: number;
  maskIsOutline?: boolean;
  maskIsOutlineTag?: number;
  backgroundOpacity?: number;
  backgroundOpacityTag?: number;
  cornerRadius?: number;
  cornerRadiusTag?: number;
  fontSize?: number;
  fontSizeTag?: number;
  paragraphIndent?: number;
  paragraphIndentTag?: number;
  paragraphSpacing?: number;
  paragraphSpacingTag?: number;
  starInnerScale?: number;
  starInnerScaleTag?: number;
  miterLimit?: number;
  miterLimitTag?: number;
  strokeWeight?: number;
  strokeWeightTag?: number;
  textTracking?: number;
  textTrackingTag?: number;
  horizontalConstraint?: ConstraintType;
  horizontalConstraintTag?: number;
  strokeAlign?: StrokeAlign;
  strokeAlignTag?: number;
  strokeCap?: StrokeCap;
  strokeCapTag?: number;
  strokeJoin?: StrokeJoin;
  strokeJoinTag?: number;
  textAlignHorizontal?: TextAlignHorizontal;
  textAlignHorizontalTag?: number;
  textAlignVertical?: TextAlignVertical;
  textAlignVerticalTag?: number;
  textCase?: TextCase;
  textCaseTag?: number;
  textDecoration?: TextDecoration;
  textDecorationTag?: number;
  booleanOperation?: BooleanOperation;
  booleanOperationTag?: number;
  verticalConstraint?: ConstraintType;
  verticalConstraintTag?: number;
  fillPaints?: Paint[];
  fillPaintsTag?: number;
  strokePaints?: Paint[];
  strokePaintsTag?: number;
  lineHeight?: Number;
  lineHeightTag?: number;
  fontName?: FontName;
  fontNameTag?: number;
  textData?: TextData;
  textDataTag?: number;
  effects?: Effect[];
  effectsTag?: number;
  handleMirroring?: VectorMirror;
  handleMirroringTag?: number;
  exportSettings?: ExportSettings[];
  exportSettingsTag?: number;
  textAutoResize?: TextAutoResize;
  textAutoResizeTag?: number;
  layoutGrids?: LayoutGrid[];
  layoutGridsTag?: number;
  vectorData?: VectorData;
  vectorDataTag?: number;
  styleID?: number;
  styleIDTag?: number;
  backgroundColor?: Color;
  backgroundColorTag?: number;
  fillGeometry?: Path[];
  fillGeometryTag?: number;
  strokeGeometry?: Path[];
  strokeGeometryTag?: number;
  stackMode?: StackMode;
  stackModeTag?: number;
  stackSpacing?: number;
  stackSpacingTag?: number;
  stackPadding?: number;
  stackPaddingTag?: number;
  guidPath?: GUIDPath;
  guidPathTag?: number;
  symbolData?: SymbolData;
  symbolDataTag?: number;
  frameMaskDisabled?: boolean;
  frameMaskDisabledTag?: number;
  resizeToFit?: boolean;
  resizeToFitTag?: number;
  exportBackgroundDisabled?: boolean;
  stackCounterAlign?: StackCounterAlign;
  stackJustify?: StackJustify;
  sharedSymbolReference?: SharedSymbolReference;
  isSymbolPublishable?: boolean;
  sharedSymbolMappings?: GUIDPathMapping[];
  derivedSymbolData?: SparseNodeChange[];
  sharedSymbolVersion?: string;
  fontVariantCommonLigatures?: boolean;
  fontVariantContextualLigatures?: boolean;
  fontVariantDiscretionaryLigatures?: boolean;
  fontVariantHistoricalLigatures?: boolean;
  fontVariantOrdinal?: boolean;
  fontVariantSlashedZero?: boolean;
  fontVariantNumericFigure?: FontVariantNumericFigure;
  fontVariantNumericSpacing?: FontVariantNumericSpacing;
  fontVariantNumericFraction?: FontVariantNumericFraction;
  fontVariantCaps?: FontVariantCaps;
  fontVariantPosition?: FontVariantPosition;
  guides?: Guide[];
  transitionNodeID?: GUID;
  prototypeStartNodeID?: GUID;
  prototypeBackgroundColor?: Color;
  internalOnly?: boolean;
  overriddenSymbolID?: GUID;
  symbolDescription?: string;
  rectangleTopLeftCornerRadius?: number;
  rectangleTopRightCornerRadius?: number;
  rectangleBottomLeftCornerRadius?: number;
  rectangleBottomRightCornerRadius?: number;
  rectangleCornerRadiiIndependent?: boolean;
  rectangleCornerToolIndependent?: boolean;
  proportionsConstrained?: boolean;
  sharedComponentMasterData?: SharedComponentMasterData;
  transitionInfo?: TransitionInfo;
  transitionType?: TransitionType;
  transitionDuration?: number;
  easingType?: EasingType;
  scrollDirection?: ScrollDirection;
  cornerSmoothing?: number;
  inheritFillStyleID?: GUID;
  inheritStrokeStyleID?: GUID;
  inheritTextStyleID?: GUID;
  inheritExportStyleID?: GUID;
  inheritEffectStyleID?: GUID;
  inheritGridStyleID?: GUID;
  inheritFillStyleIDForStroke?: GUID;
  isFillStyle?: boolean;
  isStrokeStyle?: boolean;
  styleType?: StyleType;
  styleDescription?: string;
  unflatteningMappings?: GUIDPathMapping[];
  letterSpacing?: Number;
  scrollOffset?: Vector;
  version?: string;
  sharedStyleMasterData?: SharedStyleMasterData;
  sharedStyleReference?: SharedStyleReference;
  isPublishable?: boolean;
  exportTextAsSVGText?: boolean;
  isSoftDeletedStyle?: boolean;
  isNonUpdateable?: boolean;
  scrollContractedState?: ScrollContractedState;
  contractedSize?: Vector;
  fixedChildrenDivider?: string;
  transitionPreserveScroll?: boolean;
  connectionType?: ConnectionType;
  connectionURL?: string;
  prototypeDevice?: PrototypeDevice;
  scrollBehavior?: ScrollBehavior;
  interactionType?: InteractionType;
  transitionTimeout?: number;
  interactionMaintained?: boolean;
  interactionDuration?: number;
  destinationIsOverlay?: boolean;
  backgroundPaints?: Paint[];
  inheritFillStyleIDForBackground?: GUID;
  arcData?: ArcData;
  derivedSymbolDataLayoutVersion?: number;
  navigationType?: NavigationType;
  overlayPositionType?: OverlayPositionType;
  overlayRelativePosition?: Vector;
  overlayBackgroundInteraction?: OverlayBackgroundInteraction;
  overlayBackgroundAppearance?: OverlayBackgroundAppearance;
  fontVersion?: string;
  textUserLayoutVersion?: number;
  pluginData?: PluginData[];
  toggledOnOTFeatures?: OpenTypeFeature[];
  toggledOffOTFeatures?: OpenTypeFeature[];
  transitionShouldSmartAnimate?: boolean;
  stackAlign?: StackAlign;
  stackHorizontalPadding?: number;
  stackVerticalPadding?: number;
  stackWidth?: StackSize;
  stackHeight?: StackSize;
  overrideKey?: GUID;
  publishFile?: string;
  publishID?: GUID;
  componentKey?: string;
  isC2?: boolean;
  publishedVersion?: string;
  pluginRelaunchData?: PluginRelaunchData[];
  containerSupportsFillStrokeAndCorners?: boolean;
  stackCounterSizing?: StackSize;
  containersSupportFillStrokeAndCorners?: boolean;
  hyperlink?: Hyperlink;
  keyTrigger?: KeyTrigger;
  isStateGroup?: boolean;
  prototypeInteractions?: PrototypeInteraction[];
  voiceEventPhrase?: string;
  forceUnflatteningMappings?: GUIDPathMapping[];
  stackPrimarySizing?: StackSize;
  stackPrimaryAlignItems?: StackJustify;
  stackCounterAlignItems?: StackAlign;
  stackChildPrimaryGrow?: number;
  stackPaddingRight?: number;
  stackPaddingBottom?: number;
  ancestorPathBeforeDeletion?: GUID[];
  stackChildAlignSelf?: StackCounterAlign;
  symbolLinks?: SymbolLink[];
  stateGroupPropertyValueOrders?: StateGroupPropertyValueOrder[];
  textListData?: TextListData;
  nodeGenerationData?: NodeGenerationData;
  shapeWithTextType?: ShapeWithTextType;
  connectorStart?: ConnectorEndpoint;
  connectorEnd?: ConnectorEndpoint;
  connectorLineStyle?: ConnectorLineStyle;
  connectorStartCap?: StrokeCap;
  connectorEndCap?: StrokeCap;
  shapeUserHeight?: number;
  overrideStash?: InstanceOverrideStash[];
  prototypeStartingPoint?: PrototypeStartingPoint;
  overrideStashV2?: InstanceOverrideStashV2[];
  internalEnumForTest?: InternalEnumForTest;
  originComponentKey?: string;
  connectorControlPoints?: ConnectorControlPoint[];
  derivedImmutableFrameData?: DerivedImmutableFrameData;
  connectorTextMidpoint?: ConnectorTextMidpoint;
  libraryMoveInfo?: LibraryMoveInfo;
  internalDataForTest?: InternalDataForTest;
  useAbsoluteBounds?: boolean;
  codeBlockLanguage?: CodeBlockLanguage;
  fontVariations?: FontVariation[];
  detachOpticalSizeFromFontSize?: boolean;
  widgetMetadata?: WidgetMetadata;
  widgetEvents?: WidgetEvent[];
  listSpacing?: number;
  widgetPropertyMenuItems?: WidgetPropertyMenuItem[];
  componentPropDefs?: ComponentPropDef[];
  componentPropRefs?: ComponentPropRef[];
  componentPropAssignments?: ComponentPropAssignment[];
  stackPositioning?: StackPositioning;
  embedData?: EmbedData;
  stackReverseZIndex?: boolean;
  richMediaData?: RichMediaData;
  widgetSyncedState?: MultiplayerMap;
  widgetSyncCursor?: number;
  widgetDerivedSubtreeCursor?: WidgetDerivedSubtreeCursor;
  widgetCachedAncestor?: WidgetPointer;
  renderedSyncedState?: MultiplayerMap;
  linkPreviewData?: LinkPreviewData;
  textBidiVersion?: number;
  textTruncation?: TextTruncation;
  libraryMoveHistory?: LibraryMoveHistoryItem[];
  shapeTruncates?: boolean;
  sectionContentsHidden?: boolean;
  simplifyInstancePanels?: boolean;
  widgetInputBehavior?: WidgetInputBehavior;
  widgetTooltip?: string;
  borderTopHidden?: boolean;
  borderBottomHidden?: boolean;
  borderLeftHidden?: boolean;
  borderRightHidden?: boolean;
  widgetHoverStyle?: WidgetHoverStyle;
  hasHadRTLText?: boolean;
  isWidgetStickable?: boolean;
  bordersTakeSpace?: boolean;
  borderTopWeight?: number;
  borderBottomWeight?: number;
  borderLeftWeight?: number;
  borderRightWeight?: number;
  borderStrokeWeightsIndependent?: boolean;
  videoPlayback?: VideoPlayback;
  stampData?: StampData;
  htmlTag?: HTMLTag;
  ariaRole?: ARIARole;
  accessibleLabel?: string;
  propsAreBubbled?: boolean;
  variableData?: VariableData;
}

export interface Schema {
  MessageType: any;
  Axis: any;
  Access: any;
  NodePhase: any;
  WindingRule: any;
  NodeType: any;
  ShapeWithTextType: any;
  BlendMode: any;
  PaintType: any;
  ImageScaleMode: any;
  EffectType: any;
  TextCase: any;
  TextDecoration: any;
  NumberUnits: any;
  ConstraintType: any;
  StrokeAlign: any;
  StrokeCap: any;
  StrokeJoin: any;
  BooleanOperation: any;
  TextAlignHorizontal: any;
  TextAlignVertical: any;
  MouseCursor: any;
  VectorMirror: any;
  DashMode: any;
  ImageType: any;
  ExportConstraintType: any;
  LayoutGridType: any;
  LayoutGridPattern: any;
  TextAutoResize: any;
  TextTruncation: any;
  StyleSetType: any;
  StyleSetContentType: any;
  StackMode: any;
  StackAlign: any;
  StackCounterAlign: any;
  StackJustify: any;
  StackSize: any;
  StackPositioning: any;
  ConnectionType: any;
  InteractionType: any;
  TransitionType: any;
  EasingType: any;
  ScrollDirection: any;
  ScrollContractedState: any;
  encodeGUID(message: GUID): Uint8Array;
  decodeGUID(buffer: Uint8Array): GUID;
  encodeColor(message: Color): Uint8Array;
  decodeColor(buffer: Uint8Array): Color;
  encodeVector(message: Vector): Uint8Array;
  decodeVector(buffer: Uint8Array): Vector;
  encodeRect(message: Rect): Uint8Array;
  decodeRect(buffer: Uint8Array): Rect;
  encodeColorStop(message: ColorStop): Uint8Array;
  decodeColorStop(buffer: Uint8Array): ColorStop;
  encodeMatrix(message: Matrix): Uint8Array;
  decodeMatrix(buffer: Uint8Array): Matrix;
  encodeParentIndex(message: ParentIndex): Uint8Array;
  decodeParentIndex(buffer: Uint8Array): ParentIndex;
  encodeNumber(message: Number): Uint8Array;
  decodeNumber(buffer: Uint8Array): Number;
  encodeFontName(message: FontName): Uint8Array;
  decodeFontName(buffer: Uint8Array): FontName;
  FontVariantNumericFigure: any;
  FontVariantNumericSpacing: any;
  FontVariantNumericFraction: any;
  FontVariantCaps: any;
  FontVariantPosition: any;
  FontStyle: any;
  OpenTypeFeature: any;
  encodeExportConstraint(message: ExportConstraint): Uint8Array;
  decodeExportConstraint(buffer: Uint8Array): ExportConstraint;
  encodeGUIDMapping(message: GUIDMapping): Uint8Array;
  decodeGUIDMapping(buffer: Uint8Array): GUIDMapping;
  encodeBlob(message: Blob): Uint8Array;
  decodeBlob(buffer: Uint8Array): Blob;
  encodeImage(message: Image): Uint8Array;
  decodeImage(buffer: Uint8Array): Image;
  encodeVideo(message: Video): Uint8Array;
  decodeVideo(buffer: Uint8Array): Video;
  encodeFilterColorAdjust(message: FilterColorAdjust): Uint8Array;
  decodeFilterColorAdjust(buffer: Uint8Array): FilterColorAdjust;
  encodePaintFilterMessage(message: PaintFilterMessage): Uint8Array;
  decodePaintFilterMessage(buffer: Uint8Array): PaintFilterMessage;
  encodePaint(message: Paint): Uint8Array;
  decodePaint(buffer: Uint8Array): Paint;
  encodeFontMetaData(message: FontMetaData): Uint8Array;
  decodeFontMetaData(buffer: Uint8Array): FontMetaData;
  encodeFontVariation(message: FontVariation): Uint8Array;
  decodeFontVariation(buffer: Uint8Array): FontVariation;
  encodeTextData(message: TextData): Uint8Array;
  decodeTextData(buffer: Uint8Array): TextData;
  encodeHyperlinkBox(message: HyperlinkBox): Uint8Array;
  decodeHyperlinkBox(buffer: Uint8Array): HyperlinkBox;
  encodeBaseline(message: Baseline): Uint8Array;
  decodeBaseline(buffer: Uint8Array): Baseline;
  encodeGlyph(message: Glyph): Uint8Array;
  decodeGlyph(buffer: Uint8Array): Glyph;
  encodeDecoration(message: Decoration): Uint8Array;
  decodeDecoration(buffer: Uint8Array): Decoration;
  encodeVectorData(message: VectorData): Uint8Array;
  decodeVectorData(buffer: Uint8Array): VectorData;
  encodeGUIDPath(message: GUIDPath): Uint8Array;
  decodeGUIDPath(buffer: Uint8Array): GUIDPath;
  encodeSymbolData(message: SymbolData): Uint8Array;
  decodeSymbolData(buffer: Uint8Array): SymbolData;
  encodeGUIDPathMapping(message: GUIDPathMapping): Uint8Array;
  decodeGUIDPathMapping(buffer: Uint8Array): GUIDPathMapping;
  encodeNodeGenerationData(message: NodeGenerationData): Uint8Array;
  decodeNodeGenerationData(buffer: Uint8Array): NodeGenerationData;
  encodeDerivedImmutableFrameData(message: DerivedImmutableFrameData): Uint8Array;
  decodeDerivedImmutableFrameData(buffer: Uint8Array): DerivedImmutableFrameData;
  encodeSharedSymbolReference(message: SharedSymbolReference): Uint8Array;
  decodeSharedSymbolReference(buffer: Uint8Array): SharedSymbolReference;
  encodeSharedComponentMasterData(message: SharedComponentMasterData): Uint8Array;
  decodeSharedComponentMasterData(buffer: Uint8Array): SharedComponentMasterData;
  encodeInstanceOverrideStash(message: InstanceOverrideStash): Uint8Array;
  decodeInstanceOverrideStash(buffer: Uint8Array): InstanceOverrideStash;
  encodeInstanceOverrideStashV2(message: InstanceOverrideStashV2): Uint8Array;
  decodeInstanceOverrideStashV2(buffer: Uint8Array): InstanceOverrideStashV2;
  encodeEffect(message: Effect): Uint8Array;
  decodeEffect(buffer: Uint8Array): Effect;
  encodeTransitionInfo(message: TransitionInfo): Uint8Array;
  decodeTransitionInfo(buffer: Uint8Array): TransitionInfo;
  PrototypeDeviceType: any;
  DeviceRotation: any;
  encodePrototypeDevice(message: PrototypeDevice): Uint8Array;
  decodePrototypeDevice(buffer: Uint8Array): PrototypeDevice;
  OverlayPositionType: any;
  OverlayBackgroundInteraction: any;
  OverlayBackgroundType: any;
  encodeOverlayBackgroundAppearance(message: OverlayBackgroundAppearance): Uint8Array;
  decodeOverlayBackgroundAppearance(buffer: Uint8Array): OverlayBackgroundAppearance;
  NavigationType: any;
  encodeExportSettings(message: ExportSettings): Uint8Array;
  decodeExportSettings(buffer: Uint8Array): ExportSettings;
  ExportSVGIDMode: any;
  encodeLayoutGrid(message: LayoutGrid): Uint8Array;
  decodeLayoutGrid(buffer: Uint8Array): LayoutGrid;
  encodeGuide(message: Guide): Uint8Array;
  decodeGuide(buffer: Uint8Array): Guide;
  encodePath(message: Path): Uint8Array;
  decodePath(buffer: Uint8Array): Path;
  StyleType: any;
  encodeSharedStyleReference(message: SharedStyleReference): Uint8Array;
  decodeSharedStyleReference(buffer: Uint8Array): SharedStyleReference;
  encodeSharedStyleMasterData(message: SharedStyleMasterData): Uint8Array;
  decodeSharedStyleMasterData(buffer: Uint8Array): SharedStyleMasterData;
  ScrollBehavior: any;
  encodeArcData(message: ArcData): Uint8Array;
  decodeArcData(buffer: Uint8Array): ArcData;
  encodeSymbolLink(message: SymbolLink): Uint8Array;
  decodeSymbolLink(buffer: Uint8Array): SymbolLink;
  encodePluginData(message: PluginData): Uint8Array;
  decodePluginData(buffer: Uint8Array): PluginData;
  encodePluginRelaunchData(message: PluginRelaunchData): Uint8Array;
  decodePluginRelaunchData(buffer: Uint8Array): PluginRelaunchData;
  ConnectorMagnet: any;
  encodeConnectorEndpoint(message: ConnectorEndpoint): Uint8Array;
  decodeConnectorEndpoint(buffer: Uint8Array): ConnectorEndpoint;
  encodeConnectorControlPoint(message: ConnectorControlPoint): Uint8Array;
  decodeConnectorControlPoint(buffer: Uint8Array): ConnectorControlPoint;
  ConnectorTextSection: any;
  encodeConnectorTextMidpoint(message: ConnectorTextMidpoint): Uint8Array;
  decodeConnectorTextMidpoint(buffer: Uint8Array): ConnectorTextMidpoint;
  ConnectorLineStyle: any;
  encodeLibraryMoveInfo(message: LibraryMoveInfo): Uint8Array;
  decodeLibraryMoveInfo(buffer: Uint8Array): LibraryMoveInfo;
  encodeLibraryMoveHistoryItem(message: LibraryMoveHistoryItem): Uint8Array;
  decodeLibraryMoveHistoryItem(buffer: Uint8Array): LibraryMoveHistoryItem;
  encodeWidgetPointer(message: WidgetPointer): Uint8Array;
  decodeWidgetPointer(buffer: Uint8Array): WidgetPointer;
  EditorType: any;
  encodeNodeChange(message: NodeChange): Uint8Array;
  decodeNodeChange(buffer: Uint8Array): NodeChange;
  encodeVideoPlayback(message: VideoPlayback): Uint8Array;
  decodeVideoPlayback(buffer: Uint8Array): VideoPlayback;
  encodeWidgetHoverStyle(message: WidgetHoverStyle): Uint8Array;
  decodeWidgetHoverStyle(buffer: Uint8Array): WidgetHoverStyle;
  encodeWidgetDerivedSubtreeCursor(message: WidgetDerivedSubtreeCursor): Uint8Array;
  decodeWidgetDerivedSubtreeCursor(buffer: Uint8Array): WidgetDerivedSubtreeCursor;
  encodeMultiplayerMap(message: MultiplayerMap): Uint8Array;
  decodeMultiplayerMap(buffer: Uint8Array): MultiplayerMap;
  encodeMultiplayerMapEntry(message: MultiplayerMapEntry): Uint8Array;
  decodeMultiplayerMapEntry(buffer: Uint8Array): MultiplayerMapEntry;
  encodeComponentPropRef(message: ComponentPropRef): Uint8Array;
  decodeComponentPropRef(buffer: Uint8Array): ComponentPropRef;
  ComponentPropNodeField: any;
  encodeComponentPropAssignment(message: ComponentPropAssignment): Uint8Array;
  decodeComponentPropAssignment(buffer: Uint8Array): ComponentPropAssignment;
  encodeComponentPropDef(message: ComponentPropDef): Uint8Array;
  decodeComponentPropDef(buffer: Uint8Array): ComponentPropDef;
  encodeComponentPropValue(message: ComponentPropValue): Uint8Array;
  decodeComponentPropValue(buffer: Uint8Array): ComponentPropValue;
  ComponentPropType: any;
  encodeComponentPropPreferredValues(message: ComponentPropPreferredValues): Uint8Array;
  decodeComponentPropPreferredValues(buffer: Uint8Array): ComponentPropPreferredValues;
  WidgetEvent: any;
  WidgetInputBehavior: any;
  encodeWidgetMetadata(message: WidgetMetadata): Uint8Array;
  decodeWidgetMetadata(buffer: Uint8Array): WidgetMetadata;
  WidgetPropertyMenuItemType: any;
  encodeWidgetPropertyMenuSelectorOption(message: WidgetPropertyMenuSelectorOption): Uint8Array;
  decodeWidgetPropertyMenuSelectorOption(buffer: Uint8Array): WidgetPropertyMenuSelectorOption;
  encodeWidgetPropertyMenuItem(message: WidgetPropertyMenuItem): Uint8Array;
  decodeWidgetPropertyMenuItem(buffer: Uint8Array): WidgetPropertyMenuItem;
  CodeBlockLanguage: any;
  InternalEnumForTest: any;
  encodeInternalDataForTest(message: InternalDataForTest): Uint8Array;
  decodeInternalDataForTest(buffer: Uint8Array): InternalDataForTest;
  encodeStateGroupPropertyValueOrder(message: StateGroupPropertyValueOrder): Uint8Array;
  decodeStateGroupPropertyValueOrder(buffer: Uint8Array): StateGroupPropertyValueOrder;
  encodeTextListData(message: TextListData): Uint8Array;
  decodeTextListData(buffer: Uint8Array): TextListData;
  encodeTextLineData(message: TextLineData): Uint8Array;
  decodeTextLineData(buffer: Uint8Array): TextLineData;
  BulletType: any;
  LineType: any;
  Directionality: any;
  DirectionalityIntent: any;
  encodePrototypeInteraction(message: PrototypeInteraction): Uint8Array;
  decodePrototypeInteraction(buffer: Uint8Array): PrototypeInteraction;
  encodePrototypeEvent(message: PrototypeEvent): Uint8Array;
  decodePrototypeEvent(buffer: Uint8Array): PrototypeEvent;
  encodePrototypeAction(message: PrototypeAction): Uint8Array;
  decodePrototypeAction(buffer: Uint8Array): PrototypeAction;
  encodePrototypeStartingPoint(message: PrototypeStartingPoint): Uint8Array;
  decodePrototypeStartingPoint(buffer: Uint8Array): PrototypeStartingPoint;
  TriggerDevice: any;
  encodeKeyTrigger(message: KeyTrigger): Uint8Array;
  decodeKeyTrigger(buffer: Uint8Array): KeyTrigger;
  encodeHyperlink(message: Hyperlink): Uint8Array;
  decodeHyperlink(buffer: Uint8Array): Hyperlink;
  encodeEmbedData(message: EmbedData): Uint8Array;
  decodeEmbedData(buffer: Uint8Array): EmbedData;
  encodeStampData(message: StampData): Uint8Array;
  decodeStampData(buffer: Uint8Array): StampData;
  encodeLinkPreviewData(message: LinkPreviewData): Uint8Array;
  decodeLinkPreviewData(buffer: Uint8Array): LinkPreviewData;
  encodeViewport(message: Viewport): Uint8Array;
  decodeViewport(buffer: Uint8Array): Viewport;
  encodeMouse(message: Mouse): Uint8Array;
  decodeMouse(buffer: Uint8Array): Mouse;
  encodeClick(message: Click): Uint8Array;
  decodeClick(buffer: Uint8Array): Click;
  encodeScrollPosition(message: ScrollPosition): Uint8Array;
  decodeScrollPosition(buffer: Uint8Array): ScrollPosition;
  encodeTriggeredOverlay(message: TriggeredOverlay): Uint8Array;
  decodeTriggeredOverlay(buffer: Uint8Array): TriggeredOverlay;
  encodeTriggeredOverlayData(message: TriggeredOverlayData): Uint8Array;
  decodeTriggeredOverlayData(buffer: Uint8Array): TriggeredOverlayData;
  encodePresentedState(message: PresentedState): Uint8Array;
  decodePresentedState(buffer: Uint8Array): PresentedState;
  TransitionDirection: any;
  encodeTopLevelPlaybackChange(message: TopLevelPlaybackChange): Uint8Array;
  decodeTopLevelPlaybackChange(buffer: Uint8Array): TopLevelPlaybackChange;
  encodeInstanceStateChange(message: InstanceStateChange): Uint8Array;
  decodeInstanceStateChange(buffer: Uint8Array): InstanceStateChange;
  PlaybackChangePhase: any;
  encodePlaybackChangeKeyframe(message: PlaybackChangeKeyframe): Uint8Array;
  decodePlaybackChangeKeyframe(buffer: Uint8Array): PlaybackChangeKeyframe;
  encodeStateMapping(message: StateMapping): Uint8Array;
  decodeStateMapping(buffer: Uint8Array): StateMapping;
  encodeScrollMapping(message: ScrollMapping): Uint8Array;
  decodeScrollMapping(buffer: Uint8Array): ScrollMapping;
  encodePlaybackUpdate(message: PlaybackUpdate): Uint8Array;
  decodePlaybackUpdate(buffer: Uint8Array): PlaybackUpdate;
  encodeChatMessage(message: ChatMessage): Uint8Array;
  decodeChatMessage(buffer: Uint8Array): ChatMessage;
  encodeVoiceMetadata(message: VoiceMetadata): Uint8Array;
  decodeVoiceMetadata(buffer: Uint8Array): VoiceMetadata;
  encodeUserChange(message: UserChange): Uint8Array;
  decodeUserChange(buffer: Uint8Array): UserChange;
  encodeSceneGraphQuery(message: SceneGraphQuery): Uint8Array;
  decodeSceneGraphQuery(buffer: Uint8Array): SceneGraphQuery;
  encodeNodeChangesMetadata(message: NodeChangesMetadata): Uint8Array;
  decodeNodeChangesMetadata(buffer: Uint8Array): NodeChangesMetadata;
  encodeCursorReaction(message: CursorReaction): Uint8Array;
  decodeCursorReaction(buffer: Uint8Array): CursorReaction;
  encodeTimerInfo(message: TimerInfo): Uint8Array;
  decodeTimerInfo(buffer: Uint8Array): TimerInfo;
  encodePresenterInfo(message: PresenterInfo): Uint8Array;
  decodePresenterInfo(buffer: Uint8Array): PresenterInfo;
  encodeClientBroadcast(message: ClientBroadcast): Uint8Array;
  decodeClientBroadcast(buffer: Uint8Array): ClientBroadcast;
  encodeMessage(message: Message): Uint8Array;
  decodeMessage(buffer: Uint8Array): Message;
  encodeDiffChunk(message: DiffChunk): Uint8Array;
  decodeDiffChunk(buffer: Uint8Array): DiffChunk;
  encodeDiffPayload(message: DiffPayload): Uint8Array;
  decodeDiffPayload(buffer: Uint8Array): DiffPayload;
  RichMediaType: any;
  encodeRichMediaData(message: RichMediaData): Uint8Array;
  decodeRichMediaData(buffer: Uint8Array): RichMediaData;
  VariableDataType: any;
  encodeVariableAnyValue(message: VariableAnyValue): Uint8Array;
  decodeVariableAnyValue(buffer: Uint8Array): VariableAnyValue;
  encodeVariableData(message: VariableData): Uint8Array;
  decodeVariableData(buffer: Uint8Array): VariableData;
  HTMLTag: any;
  ARIARole: any;
  encodeSparseMessage(message: SparseMessage): Uint8Array;
  decodeSparseMessage(buffer: Uint8Array): SparseMessage;
  encodeSparseNodeChange(message: SparseNodeChange): Uint8Array;
  decodeSparseNodeChange(buffer: Uint8Array): SparseNodeChange;
}
