import { lessons, gateInfo } from '../tutorial/tutorialLessons.js';
import { plainExplanations } from '../tutorial/tutorialPlainLanguage.js';
export const viTutorial={};
const entries={
qubit:['Qubit là gì?',[
 ['Trạng thái và biên độ','Qubit có hai trạng thái cơ sở |0⟩ và |1⟩. Trạng thái thuần tổng quát là |ψ⟩ = α|0⟩ + β|1⟩. Các hệ số là biên độ; chúng có thể âm hoặc là số phức.'],
 ['Quan sát |0⟩','Đây là mạch trống gồm một qubit. Bấm Chạy mạch để xem trạng thái ban đầu thật.','Kết quả mô phỏng là |0⟩ với xác suất 1.'],
 ['Từ biên độ đến xác suất','P(0) = |α|² và P(1) = |β|². Bình phương độ lớn cho ta xác suất; bản thân biên độ không phải xác suất.'],
 ['Chuẩn hóa','Tổng xác suất bằng 1: |α|² + |β|² = 1. Hãy xem bảng biên độ và các cột xác suất của lần chạy này.'],
]],
x:['Cổng X',[
 ['Đảo trạng thái cơ sở','X|0⟩ = |1⟩ và X|1⟩ = |0⟩. Trên cầu Bloch, đây là phép quay π quanh trục x, nếu bỏ qua pha toàn cục không quan sát được.'],
 ['Áp dụng X','Chọn X, đặt lên q0 ở bước 1 rồi bấm Chạy mạch.','Kết quả thật là |1⟩: X đã đảo trạng thái ban đầu |0⟩.'],
 ['Một phép quay','So sánh mũi tên Bloch với cực |1⟩. Cầu Bloch là hình biểu diễn toán học của trạng thái một qubit, không phải một quả cầu vật lý. Pha toàn cục không đổi mũi tên, còn pha tương đối có thể đổi nó.'],
 ['Áp dụng X lần nữa','Cổng X đầu tiên đã có sẵn. Thêm X thứ hai ở bước 2 rồi chạy.','Hai cổng X đưa qubit trở lại |0⟩.'],
]],
h:['Cổng Hadamard',[
 ['Tạo chồng chập','H|0⟩ = (|0⟩ + |1⟩)/√2. Đây là một trạng thái lượng tử kết hợp với hai kết quả đo có thể xảy ra, không phải hai bit cổ điển.'],
 ['Áp dụng H','Đặt H lên q0 ở bước 1 rồi chạy.','Mỗi kết quả có xác suất 50%. Bạn đã chuẩn bị |+⟩.'],
 ['Kết hợp trở lại','Thêm H sau cổng H có sẵn rồi chạy.','Các biên độ giao thoa để đưa trạng thái về |0⟩. H là nghịch đảo của chính nó.'],
]],
phase:['Pha',[
 ['Chuẩn bị |+⟩','Áp dụng H rồi chạy. Quan sát biên độ và mũi tên.','Hai biên độ có cùng pha.'],
 ['Chuẩn bị |−⟩','H đã có sẵn. Thêm Z sau H rồi chạy.','Xác suất vẫn là 50/50 nhưng dấu tương đối đã thay đổi.'],
 ['Cùng xác suất, khác trạng thái','|+⟩ = (|0⟩ + |1⟩)/√2 và |−⟩ = (|0⟩ − |1⟩)/√2 có cùng xác suất đo theo cơ sở tính toán. Pha tương đối khác nhau dẫn đến giao thoa khác nhau.'],
 ['Hai mũi tên đối nhau','Cầu Bloch là hình toán học, không phải quả cầu vật lý. Hai hướng đối nhau trên xích đạo biểu diễn |+⟩ và |−⟩. Pha toàn cục không làm đổi mũi tên; pha tương đối có thể làm đổi.'],
]],
z:['Cổng Z',[
 ['Đổi pha tương đối','Z giữ nguyên |0⟩ và đổi dấu biên độ |1⟩. Bắt đầu bằng H để có cả hai thành phần.'],
 ['Chuẩn bị đầu vào','Áp dụng H rồi chạy để chuẩn bị |+⟩.','Cả hai thành phần đều có mặt; pha tương đối giữa chúng có thể thay đổi.'],
 ['Áp dụng Z','Thêm Z sau H rồi chạy.','Z|+⟩ = |−⟩. Chú ý: xác suất không đổi.'],
 ['Quan sát mũi tên','Cầu Bloch biểu diễn trạng thái bằng toán học. Hai hướng đối nhau trên xích đạo là |+⟩ và |−⟩. Pha tương đối thay đổi hướng mũi tên, còn pha toàn cục không có tác dụng này.'],
]],
y:['Cổng Y',[
 ['Quay quanh trục y','Y là phép quay π quanh y nếu bỏ qua pha toàn cục. Y|0⟩ = i|1⟩; hệ số i chung đó không làm thay đổi trạng thái vật lý.'],
 ['Thử Y','Áp dụng Y lên q0 rồi chạy. Bạn có thể bỏ qua bài tập này.','Mũi tên hướng về |1⟩. Pha toàn cục của nó không quan sát được.'],
 ['Quan sát phép quay','Cầu Bloch là hình toán học biểu diễn trạng thái một qubit. Hướng mũi tên không phụ thuộc pha toàn cục.'],
]],
s:['Cổng S',[
 ['Một góc quay pha','S thêm pha π/2 cho thành phần |1⟩. Bắt đầu từ |+⟩ để nhìn thấy tác động của pha tương đối.'],
 ['Bắt đầu bằng H','Áp dụng H rồi chạy.','Mũi tên nằm trên trục +x.'],
 ['Thêm S','Thêm S sau H rồi chạy.','Pha tương đối đổi π/2. Xác suất vẫn là 50/50.'],
 ['So sánh góc quay pha','S quay mũi tên trên xích đạo 90°; T quay 45°. Cầu Bloch là hình toán học của trạng thái qubit, không phải quả cầu vật lý.'],
]],
t:['Cổng T',[
 ['Một góc quay pha','T thêm pha π/4 cho thành phần |1⟩, bằng nửa mức đổi pha của S. Bắt đầu từ |+⟩ để thấy tác động.'],
 ['Bắt đầu bằng H','Áp dụng H rồi chạy.','Mũi tên nằm trên trục +x.'],
 ['Thêm T','Thêm T sau H rồi chạy.','Pha tương đối đổi π/4. Xác suất vẫn là 50/50.'],
 ['So sánh góc quay pha','S quay mũi tên trên xích đạo 90°; T quay 45°. Đây là hình toán học của trạng thái qubit, không phải quả cầu vật lý.'],
]],
rotations:['Các cổng quay',[
 ['Chọn trục và góc','Rx(θ), Ry(θ), Rz(θ) quay quanh trục x, y, z. Góc tính bằng radian: π/2 là một phần tư vòng, π/4 là một phần tám vòng.'],
 ...['RX','RY','RZ'].map(g=>['Thử '+g,`Chọn ${g}, đặt góc π/2 (1.5708), đặt cổng sau các cổng có sẵn rồi chạy.`,'Kết quả mô phỏng cho thấy phép quay một phần tư vòng như dự đoán.']),
 ['Thử π/4','Chọn Ry, đặt góc 0.7854 (π/4), đặt vào mạch trống rồi chạy.','Đây là một phần tám vòng, bằng nửa đường đến xích đạo.'],
 ['Đọc mũi tên','Quan sát hướng trong hình biểu diễn trạng thái. Đổi thứ tự các phép quay quanh những trục khác nhau thường cho kết quả khác nhau.'],
]],
measurement:['Phép đo',[
 ['Một kết quả cổ điển','Phép đo lấy một kết quả cổ điển theo xác suất hiện tại, rồi làm trạng thái co sụp. Một kết quả không thể cho biết tất cả biên độ.'],
 ['Chuẩn bị |+⟩','Áp dụng H rồi chạy.','Mỗi bit có xác suất được đo là 50%.'],
 ['Đo q0','Thêm phép đo sau H rồi chạy. Cả 0 và 1 đều là kết quả hợp lệ.','Bạn đã nhận được một kết quả đo thật. Trạng thái hiện tại khớp với bit đo được.'],
 ['Trước và sau','Các cột này biểu diễn trạng thái SAU phép đo, nên một kết quả có xác suất 1. Chạy lại sẽ tạo mạch mới từ |0⟩ và lấy mẫu lại; không phải hoàn tác phép đo trên cùng qubit vật lý.'],
]],
multiple:['Nhiều qubit',[
 ['Bốn trạng thái cơ sở','Hai qubit có các trạng thái |00⟩, |01⟩, |10⟩, |11⟩ và bốn biên độ. Trong công cụ này q0 là bit BÊN TRÁI.'],
 ['Quan sát hai qubit','Chạy mạch trống hai qubit này.','Trình mô phỏng trả về đủ bốn trạng thái cơ sở.'],
 ['Không gian trạng thái lớn dần','Trạng thái thuần tổng quát của n qubit cần 2ⁿ biên độ. Mỗi lần đo vẫn chỉ cho n bit cổ điển.'],
]],
cnot:['Cổng CNOT',[
 ['Điều khiển và đích','Chấm đặc là điều khiển; ⊕ là đích. Khi q0 điều khiển q1, |00⟩ vẫn là |00⟩ và |10⟩ thành |11⟩.'],
 ['Chuẩn bị |10⟩','Áp dụng X lên q0 rồi chạy.','q0 là 1; q1 là 0.'],
 ['Áp dụng CNOT','Chọn CNOT, chọn đích q1, bấm q0 ở bước 2 rồi chạy.','Điều khiển là 1 nên đích bị đảo, cho |11⟩.'],
]],
entanglement:['Rối lượng tử',[
 ['Chuẩn bị chồng chập','Áp dụng H lên q0 rồi chạy.','q0 ở trạng thái chồng chập và q1 vẫn là |0⟩.'],
 ['Tạo rối cho cặp qubit','Thêm CNOT sau H với điều khiển q0 và đích q1 rồi chạy.','Bạn đã tạo (|00⟩ + |11⟩)/√2, một trạng thái Bell.'],
 ['Một trạng thái chung','Không thể mô tả cặp này bằng hai trạng thái thuần độc lập. Mỗi qubit riêng lẻ là trạng thái hỗn hợp nên ở đây không hiển thị mũi tên Bloch của một trạng thái thuần.'],
 ['Kết quả có tương quan','Đo cả hai qubit theo cơ sở này cho 00 hoặc 11. Kết quả có tương quan; rối lượng tử không truyền thông tin nhanh hơn ánh sáng.'],
]],
'bell-challenge':['Thử thách trạng thái Bell',[
 ['Tạo trạng thái Bell','Bắt đầu từ |00⟩, dùng H, X và CNOT để tạo (|00⟩ + |11⟩)/√2. Bấm Chạy mạch khi sẵn sàng. Các cổng khác vẫn có sẵn nhưng thử thách này chỉ dùng ba loại trên.','Biên độ thật của bạn khớp trạng thái Bell mục tiêu, nếu bỏ qua pha toàn cục không quan sát được.'],
]],
noise:['Tổng quan về nhiễu',[
 ['Chạy lý tưởng và có nhiễu','Cổng lý tưởng thực hiện đúng thao tác dự kiến. Lỗi cổng, mất năng lượng (T1), mất tính kết hợp (T2) và lỗi đọc có thể thay đổi kết quả.'],
 ['Thử chế độ có nhiễu','Đổi chế độ sang Có nhiễu rồi chạy mạch H có sẵn. Không yêu cầu kết quả ngẫu nhiên cụ thể nào.','Một lần mô phỏng có nhiễu thật đã hoàn thành. Các lần chạy có thể khác nhau.'],
 ['Các điều khiển hiện tại','Ứng dụng dùng thông số nhiễu cố định ở máy chủ. Thanh trượt chỉ cập nhật giao diện, chưa gửi giá trị vào phép tính. Một lần chạy là một mẫu ngẫu nhiên, không phải trung bình nhiều lần hay thí nghiệm T1/T2 có kiểm soát.'],
]],
t1:['Thư giãn T1',[
 ['Mất năng lượng','T1 là thang thời gian để quần thể ở |1⟩ thư giãn về |0⟩. Nó không có nghĩa là mọi qubit đều bị đảo sau một khoảng thời gian cố định.'],
 ['Trạng thái kích thích có nhiễu','Chuyển sang Có nhiễu rồi chạy mạch X có sẵn. Một lần chạy ngắn vẫn có thể cho trạng thái gần |1⟩.','Lần chạy có nhiễu thật đã xong. Một mẫu duy nhất không đo được đường cong suy giảm T1.'],
 ['Điều khiển mang tính minh họa','Thông số nhiễu ở máy chủ hiện cố định. Thanh trượt chưa tác động đến phép tính và giao diện chưa có chức năng thay đổi thời gian chờ.'],
]],
t2:['Tính kết hợp T2',[
 ['Mất tính kết hợp pha','T2 mô tả sự suy giảm tính kết hợp giữa |0⟩ và |1⟩. Mất pha thuần có thể thay đổi tính kết hợp mà không đổi quần thể; mất năng lượng cũng góp phần vào T2.'],
 ['Chồng chập có nhiễu','Chuyển sang Có nhiễu rồi chạy H. Quan sát kết quả thật; một mẫu không phải trạng thái hỗn hợp trung bình của nhiều lần chạy.','Đây là một mẫu có nhiễu. Chỉ các cột xác suất không mô tả đầy đủ tính kết hợp pha.'],
 ['Hiểu mô hình này','Máy chủ dùng thông số cố định. Thanh trượt chưa tác động đến phép tính. Một lần mô phỏng không phải thí nghiệm có thể điều chỉnh T2 hay kết quả trung bình nhiều lần.'],
]],
readout:['Lỗi đọc kết quả',[
 ['Trạng thái và bit được báo','Lỗi đọc có thể báo sai bit cổ điển dù trạng thái đã được chuẩn bị đúng. Nó khác với lỗi cổng.'],
 ['Đo khi có nhiễu','Chuyển sang Có nhiễu, thêm phép đo sau X có sẵn rồi chạy. Bit được báo có thể bị đảo do lỗi đọc.','Một bit thật đã được trả về. Cần nhiều lần thử để ước lượng lỗi đọc.'],
 ['Điều khiển lỗi đọc','Thông số nhiễu ở máy chủ hiện cố định. Thanh trượt chỉ đổi giao diện và chưa tác động đến phép tính; đây không phải thí nghiệm lỗi đọc đã hiệu chuẩn.'],
]],
qft:['Biến đổi Fourier lượng tử',[['Biến đổi Fourier lượng tử','QFT biến đổi biên độ giữa cơ sở tính toán và cơ sở Fourier. Pha tương đối chứa cấu trúc; QFT được dùng trong tìm chu kỳ lượng tử.']]],
grover:['Tìm kiếm Grover',[['Tìm kiếm Grover','Grover luân phiên đánh dấu pha và giao thoa để khuếch đại kết quả được đánh dấu. Khám phá hoạt động đánh dấu và khuếch tán trong Nhiệm vụ lượng tử.']]],
shor:['Thuật toán Shor',[['Thuật toán Shor','Shor kết hợp tìm chu kỳ lượng tử với xử lý cổ điển để phân tích số nguyên thành thừa số. Mở mục Thuật toán để sử dụng giao diện đầy đủ.']]],
};
for(const lesson of lessons){
  const entry=entries[lesson.id];
  if(!entry || entry[1].length!==lesson.steps.length)throw new Error('Vietnamese lesson coverage: '+lesson.id);
  viTutorial[lesson.title]=entry[0];
  lesson.steps.forEach((step,i)=>{
    const [title,message,success]=entry[1][i];
    viTutorial[step.title]=title;viTutorial[step.message]=message;
    if(step.successMessage){if(!success)throw new Error('Missing success translation');viTutorial[step.successMessage]=success;}
  });
}
const gateTranslations={
X:'Đảo |0⟩ và |1⟩. Tương đương quay π quanh x nếu bỏ qua pha toàn cục.',
H:'Tạo và kết hợp lại các trạng thái chồng chập. Áp dụng H hai lần trả về trạng thái ban đầu.',
Y:'Quay π quanh y nếu bỏ qua pha toàn cục. Y|0⟩ = i|1⟩.',
Z:'Đổi dấu pha của thành phần |1⟩. Pha tương đối có thể thay đổi giao thoa.',
S:'Thêm pha π/2 cho thành phần |1⟩.',T:'Thêm pha π/4 cho thành phần |1⟩, bằng nửa mức đổi pha của S.',
RX:'Quay mũi tên Bloch quanh x theo góc radian đã chọn.',RY:'Quay mũi tên Bloch quanh y theo góc radian đã chọn.',RZ:'Quay mũi tên Bloch quanh z, làm đổi pha tương đối.',
CNOT:'Đảo qubit đích khi qubit điều khiển là |1⟩. Bấm dây điều khiển và chọn đích trong danh sách.',
MEASURE:'Lấy một bit theo xác suất của trạng thái rồi làm qubit được đo co sụp. Một lần đo không cho biết toàn bộ trạng thái.',
};
for(const [gate,text]of Object.entries(gateInfo))viTutorial[text]=gateTranslations[gate];
const plain={
qubit:['Qubit là đơn vị mà máy tính lượng tử xử lý. Khi đo, ta nhận được 0 hoặc 1. |0⟩ và |1⟩ chỉ là cách viết hai kết quả đó.','Các cột cho biết khả năng xuất hiện mỗi kết quả. Biên độ là những số dùng để tính các khả năng ấy, chứ không phải xác suất.','Tất cả xác suất phải cộng lại thành 100%. Quy tắc đó gọi là chuẩn hóa.'],
x:['X là phép đảo: biến 0 thành 1 hoặc 1 thành 0.','Mũi tên biểu diễn trạng thái qubit. Sau X, nó hướng về 1. Đây là hình minh họa, không phải vật thể bên trong qubit.'],
h:['H có thể biến trạng thái chắc chắn là 0 thành trạng thái có 50% khả năng đo ra 0 và 50% đo ra 1. Hãy thử nhé.'],
phase:['Hai trạng thái có cùng xác suất 50/50 nhưng khác dấu trong biên độ. Đó là khác biệt về pha tương đối; nó có tác dụng khi ta thêm cổng.','Mũi tên đổi hướng dù xác suất giữ nguyên. Hình này giúp ta nhìn thấy pha tương đối.'],
z:['Z đổi dấu thành phần |1⟩. Các cột xác suất có thể giữ nguyên, nhưng cổng thêm vào sau đó sẽ cho thấy sự khác biệt.','Chú ý mũi tên đã đổi hướng. Chỉ các cột xác suất không nói lên toàn bộ trạng thái lượng tử.'],
y:['Y là một kiểu đảo khác. Bắt đầu từ 0, nó đưa đến 1. Trên hình cầu, đó là nửa vòng quanh trục y.','Theo mũi tên hướng về 1. Cầu là hình biểu diễn trạng thái, không phải vật thể thật.'],
s:['S đổi pha tương đối. Trên hình cầu, nó quay mũi tên trên vòng giữa 90°.','S quay pha 90°, còn T quay 45°. Cả hai đều có thể giữ nguyên các cột xác suất.'],
t:['T đổi pha tương đối 45°, bằng nửa mức của S.','So sánh với bài S. T quay mũi tên 45° thay vì 90°.'],
rotations:['Các cổng này cho bạn chọn góc quay. Rx quay quanh x, Ry quanh y, Rz quanh z.','Mũi tên cho thấy trạng thái thay đổi thế nào. Đổi trục hoặc thứ tự quay có thể đổi kết quả.'],
measurement:['Phép đo cho một bit thông thường: 0 hoặc 1. Các cột cho biết khả năng của từng kết quả. Một lần đo không tiết lộ toàn bộ trạng thái.','Sau khi đo, một cột đạt 100%. Chạy lại sẽ tạo mạch mới, nên bạn có thể nhận kết quả khác.'],
multiple:['Với hai qubit, kết quả có thể là 00, 01, 10 hoặc 11. q0 là chữ số bên trái, q1 là bên phải.','Thêm một qubit sẽ gấp đôi số chuỗi bit có thể có. Nhưng một lần đo chỉ cho một chuỗi.'],
cnot:['CNOT nối hai qubit. Nếu điều khiển là 1, nó đảo đích. Nếu điều khiển là 0, nó giữ nguyên đích.'],
entanglement:['Hai qubit chia sẻ một trạng thái không thể tách thành hai trạng thái thuần riêng biệt. Mối liên hệ đó gọi là rối lượng tử.','Đo cặp này cho 00 hoặc 11: hai bit giống nhau. Điều này không cho phép gửi tin nhanh hơn ánh sáng.'],
noise:['Thiết bị thật không hoàn hảo. Chế độ Có nhiễu mô phỏng một số sai sót; chế độ Lý tưởng bỏ qua chúng.','Thanh trượt chưa kết nối với phép tính. Chế độ Có nhiễu hoạt động nhưng dùng thông số cố định. Mỗi lần chạy chỉ là một mẫu.'],
t1:['T1 mô tả việc qubit mất năng lượng. Qubit được chuẩn bị là 1 có thể dần chuyển về 0.','Ứng dụng chưa cho đổi thời gian chờ hoặc T1 thật. Một lần chạy ngắn vẫn có thể gần 1.'],
t2:['T2 mô tả sự phai dần của mối liên hệ pha giữa hai thành phần trong chồng chập. Điều này có thể xảy ra mà các cột xác suất không đổi rõ rệt.','Một lần chạy có nhiễu không cho thấy toàn bộ quy luật. Thanh trượt chưa tác động đến phép tính.'],
readout:['Đôi khi trạng thái được chuẩn bị đúng nhưng thiết bị báo sai bit. Đó là lỗi đọc kết quả.','Cần nhiều lần chạy để ước lượng tần suất báo sai. Thanh trượt chưa kết nối với phép tính.'],
qft:['Biến đổi Fourier lượng tử giúp nhận ra quy luật chứa trong pha lượng tử. Nó là một phần của thuật toán Shor.'],
grover:['Tìm kiếm Grover dùng cổng để tăng khả năng tìm ra đáp án mong muốn. Bạn có thể khám phá trong Nhiệm vụ lượng tử.'],
shor:['Shor tìm quy luật lặp lại để giúp tìm thừa số của một số. Hãy thử ví dụ có sẵn trong mục Thuật toán.'],
};
for(const [id,steps] of Object.entries(plainExplanations))Object.values(steps).forEach((text,i)=>{if(!plain[id]?.[i])throw new Error('Missing plain Vietnamese: '+id);viTutorial[text]=plain[id][i];});
