export type MoodKey = 'happy' | 'sad' | 'tired' | 'excited' | 'stressed' | 'chill' | 'romantic' | 'energetic';

export interface IcebreakerQuestion {
  id: string;
  question: string;
  moods: MoodKey[];
}

export const ICEBREAKER_QUESTIONS: IcebreakerQuestion[] = [
  {
    id: '1',
    question: 'วันนี้มีอะไรทำให้คุณยิ้มได้สั้นๆ บ้างไหม?',
    moods: ['tired', 'stressed', 'sad'],
  },
  {
    id: '2',
    question: 'เพลงโปรดเพลงไหนที่ติดอยู่ในหัวคุณตอนนี้?',
    moods: ['happy', 'excited', 'energetic'],
  },
  {
    id: '3',
    question: 'ถ้าวันนี้เป็นสีหนึ่งสี คุณคิดว่าเป็นสีอะไร?',
    moods: ['chill', 'romantic', 'happy'],
  },
  {
    id: '4',
    question: 'เรื่องเล็กๆ เรื่องหนึ่งที่คุณรู้สึกขอบคุณในวันนี้คืออะไร?',
    moods: ['tired', 'stressed', 'sad', 'chill'],
  },
  {
    id: '5',
    question: 'ถ้าคุณสามารถวาร์ปไปที่ไหนก็ได้ในตอนนี้ คุณอยากไปที่ไหน?',
    moods: ['stressed', 'tired', 'excited'],
  },
  {
    id: '6',
    question: 'อะไรคือสิ่งที่ทำให้คุณรู้สึกผ่อนคลายที่สุด?',
    moods: ['stressed', 'tired', 'chill'],
  },
  {
    id: '7',
    question: 'วันนี้มีใครที่อยากขอบคุณเป็นพิเศษไหม?',
    moods: ['romantic', 'happy', 'excited'],
  },
  {
    id: '8',
    question: 'ถ้าต้องอธิบายความรู้สึกตอนนี้เป็นอาหารหนึ่งอย่าง จะเป็นอะไร?',
    moods: ['happy', 'sad', 'tired', 'excited', 'stressed', 'chill', 'romantic', 'energetic'],
  },
];
