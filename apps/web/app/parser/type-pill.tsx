/*
enum NodeType {
  NONE = 0;
  DOCUMENT = 1;
  CANVAS = 2;
  GROUP = 3;
  FRAME = 4;
  BOOLEAN_OPERATION = 5;
  VECTOR = 6;
  STAR = 7;
  LINE = 8;
  ELLIPSE = 9;
  RECTANGLE = 10;
  REGULAR_POLYGON = 11;
  ROUNDED_RECTANGLE = 12;
  TEXT = 13;
  SLICE = 14;
  SYMBOL = 15;
  INSTANCE = 16;
  STICKY = 17;
  SHAPE_WITH_TEXT = 18;
  CONNECTOR = 19;
  CODE_BLOCK = 20;
  WIDGET = 21;
  STAMP = 22;
  MEDIA = 23;
  HIGHLIGHT = 24;
  SECTION = 25;
  SECTION_OVERLAY = 26;
  WASHI_TAPE = 27;
  VARIABLE = 28;
}

*/

import { cn } from '@/lib/utils'
import type { NodeType } from 'fig-kiwi/schema-defs'

export function abbreviateType(type: string) {
  switch (type) {
    case 'DOCUMENT':
      return 'DOCU'
    case 'CANVAS':
      return 'CANV'
    case 'FRAME':
      return 'FRAME'
    case 'BOOLEAN_OPERATION':
      return 'BO'
    case 'VECTOR':
      return 'VEC'
    case 'STAR':
      return 'STAR'
    case 'LINE':
      return 'LINE'
    case 'ELLIPSE':
      return 'ELLIP'
    case 'RECTANGLE':
      return 'RECT'
    case 'REGULAR_POLYGON':
      return 'POLY'
    case 'ROUNDED_RECTANGLE':
      return 'RRECT'
    case 'TEXT':
      return 'TXT'
    case 'SLICE':
      return 'SLC'
    case 'SYMBOL':
      return 'SYM'
    case 'INSTANCE':
      return 'INST'
    case 'STICKY':
      return 'STKY'
    case 'SHAPE_WITH_TEXT':
      return 'SWT'
    case 'CONNECTOR':
      return 'CONN'
    case 'CODE_BLOCK':
      return 'CB'
    case 'WIDGET':
      return 'WIDG'
    case 'STAMP':
      return 'STMP'
    case 'MEDIA':
      return 'MEDI'
    case 'HIGHLIGHT':
      return 'HGLT'
    case 'SECTION':
      return 'SEC'
    case 'SECTION_OVERLAY':
      return 'SOV'
    case 'WASHI_TAPE':
      return 'WTAPE'
    case 'VARIABLE':
      return 'VAR'
    default:
      return '????'
  }
}

function colorType(type: string): string {
  switch (type as NodeType) {
    case 'DOCUMENT':
      return 'bg-gray-100 text-gray-800' // light grey
    case 'CANVAS':
      return 'bg-white text-gray-800' // white
    case 'GROUP':
      return 'bg-yellow-200 text-yellow-800' // light yellow
    case 'FRAME':
      return 'bg-blue-200 text-blue-800' // light blue
    case 'BOOLEAN_OPERATION':
      return 'bg-purple-200 text-purple-800' // light purple
    case 'VECTOR':
      return 'bg-green-200 text-green-800' // light green
    case 'STAR':
      return 'bg-pink-200 text-pink-800' // light pink
    case 'LINE':
      return 'bg-red-200 text-red-800' // light red
    case 'ELLIPSE':
      return 'bg-teal-200 text-teal-800' // light teal
    case 'RECTANGLE':
      return 'bg-indigo-200 text-indigo-800' // light indigo
    case 'REGULAR_POLYGON':
      return 'bg-orange-200 text-orange-800' // light orange
    case 'ROUNDED_RECTANGLE':
      return 'bg-gray-400 text-gray-800' // grey
    case 'TEXT':
      return 'bg-yellow-400 text-yellow-800' // yellow
    case 'SLICE':
      return 'bg-red-400 text-red-800' // red
    case 'SYMBOL':
      return 'bg-blue-400 text-blue-800' // blue
    case 'INSTANCE':
      return 'bg-green-400 text-green-800' // green
    case 'STICKY':
      return 'bg-pink-400 text-pink-800' // pink
    case 'SHAPE_WITH_TEXT':
      return 'bg-teal-400 text-teal-800' // teal
    case 'CONNECTOR':
      return 'bg-purple-400 text-purple-800' // purple
    case 'CODE_BLOCK':
      return 'bg-gray-800 text-white' // black
    case 'WIDGET':
      return 'bg-indigo-400 text-indigo-800' // indigo
    case 'STAMP':
      return 'bg-orange-400 text-orange-800' // orange
    case 'MEDIA':
      return 'bg-gray-600 text-gray-800' // dark grey
    case 'HIGHLIGHT':
      return 'bg-yellow-600 text-yellow-800' // dark yellow
    case 'SECTION':
      return 'bg-blue-600 text-blue-800' // dark blue
    case 'SECTION_OVERLAY':
      return 'bg-green-600 text-green-800' // dark green
    case 'WASHI_TAPE':
      return 'bg-pink-600 text-pink-800' // dark pink
    case 'VARIABLE':
      return 'bg-teal-600 text-teal-800' // dark teal
    default:
      return 'bg-gray-100 text-gray-800' // light grey
  }
}

export function TypePill({ type }: { type: string }) {
  return (
    <span
      className={cn(
        'mr-2 rounded-md text-ellipsis w-12 text-center self-baseline px-1 py-0.5 text-xs font-medium',
        colorType(type)
      )}
    >
      {abbreviateType(type)}
    </span>
  )
}
