/**
 * Shot Property Options
 * 
 * Each option has:
 * - value: The internal value stored in DB (English usually, or matching label)
 * - label: The display text (Vietnamese)
 */

export const SHOT_SIZES = [
    { value: 'Extreme Wide', label: 'Cực rộng (Extreme Wide)' },
    { value: 'Long / Wide', label: 'Toàn cảnh (Long/Wide)' },
    { value: 'Full', label: 'Toàn thân (Full)' },
    { value: 'Full Body Wide', label: 'Toàn thân rộng (Full Body Wide)' },
    { value: 'Medium Long / Medium Wide', label: 'Trung toàn (Medium Long)' },
    { value: 'Medium', label: 'Trung cảnh (Medium)' },
    { value: 'Medium Close-up', label: 'Trung cận (Medium Close-up)' },
    { value: 'Close up', label: 'Cận cảnh (Close up)' },
    { value: 'Extreme Close-up', label: 'Đặc tả (Extreme Close-up)' },
    { value: 'Establishing', label: 'Thiết lập (Establishing)' },
];

export const SHOT_PERSPECTIVES = [
    { value: 'Eye Level', label: 'Ngang tầm mắt (Eye Level)' },
    { value: 'Low Angle', label: 'Góc thấp (Low Angle)' },
    { value: 'High Angle', label: 'Góc cao (High Angle)' },
    { value: 'Hip Level', label: 'Ngang hông (Hip Level)' },
    { value: 'Knee Level', label: 'Ngang gối (Knee Level)' },
    { value: 'Ground Level', label: 'Sát đất (Ground Level)' },
    { value: 'Shoulder-Level', label: 'Ngang vai (Shoulder-Level)' },
    { value: 'Dutch Angle', label: 'Góc nghiêng (Dutch Angle)' },
    { value: 'Birds-Eye-View / Overhead', label: 'Trực diện từ trên (Overhead)' },
    { value: 'Aerial', label: 'Trên không (Aerial)' },
    { value: 'Top-View', label: 'Góc nhìn từ trên xuống (Top-View)' },
    { value: 'Over the Shoulder', label: 'Qua vai (Over the Shoulder)' },
    { value: 'From Behind', label: 'Từ phía sau (From Behind)' },
];

export const SHOT_MOVEMENTS = [
    { value: 'Static / Fixed', label: 'Tĩnh (Static)' },
    { value: 'Dolly', label: 'Dolly' },
    { value: 'Zoom', label: 'Thu phóng (Zoom)' },
    { value: 'Dolly Zoom', label: 'Dolly Zoom' },
    { value: 'Pan', label: 'Pan (Lia ngang)' },
    { value: 'Tilt', label: 'Tilt (Lia dọc)' },
    { value: 'Whip Pan', label: 'Whip Pan' },
    { value: 'Whip Tilt', label: 'Whip Tilt' },
    { value: 'Tracking', label: 'Tracking' },
    { value: 'Crab', label: 'Crab' },
    { value: 'Arc', label: 'Arc' },
];

export const SHOT_EQUIPMENT = [
    { value: 'Sticks / Tripod', label: 'Chân máy (Tripod)' },
    { value: 'Slider', label: 'Slider' },
    { value: 'Handheld', label: 'Cầm tay (Handheld)' },
    { value: 'Steadicam', label: 'Steadicam' },
    { value: 'Gimbal', label: 'Gimbal' },
    { value: 'Crane', label: 'Cần cẩu (Crane)' },
    { value: 'Jib', label: 'Jib' },
    { value: 'Drone', label: 'Flycam / Drone' },
    { value: 'Wire', label: 'Dây cáp (Wire)' },
];

export const ASPECT_RATIOS = [
    { value: '16:9', label: '16:9' },
    { value: '1.85:1', label: '1.85:1 (Widescreen)' },
    { value: '2.35:1', label: '2.35:1 (Cinemascope)' },
    { value: '4:3', label: '4:3' },
    { value: '2:1', label: '2:1 (Univisium)' },
    { value: '2.76:1', label: '2.76:1 (Ultra Panavision)' },
    { value: '1.43:1', label: '1.43:1 (IMAX)' },
    { value: '1.33:1', label: '1.33:1' },
    { value: '1:1', label: '1:1 (Square)' },
];
