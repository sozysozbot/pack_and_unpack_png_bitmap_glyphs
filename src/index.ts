import * as fs from 'fs';
import * as pngjs from 'pngjs';

export async function to_txts(o: {
	in_path: string, 
	out_path: string, 
	start: number, 
	end: number, 
	filepath_to_codepoint: (filepath: string) => number}) {
	const in_path = o.in_path;
	const out_path = o.out_path;
	const files = fs.readdirSync(`${in_path}/`);
	files.forEach((file, index) => {
		fs.createReadStream(`${in_path}/${file}`)
			.pipe(new pngjs.PNG())
			.on("parsed", function () {
				let ans = "";
				const codepoint = o.filepath_to_codepoint(file);
				if (codepoint < o.start || codepoint >= o.end) {
					return;
				}
				let info = `0x${codepoint.toString(16).padStart(4, '0')}`;
				console.log(info);
				ans += info + "\n";
				let txt = "";
				for (let y = 0; y < this.height; y++) {
					for (let x = 0; x < this.width; x++) {
						let idx = (this.width * y + x) << 2;
						if (this.data[idx] === 0
							&& this.data[idx + 1] === 0
							&& this.data[idx + 2] === 0
							&& this.data[idx + 3] === 255
						) {
							txt += "@";
						} else if (this.data[idx] === 255
							&& this.data[idx + 1] === 255
							&& this.data[idx + 2] === 255
							&& this.data[idx + 3] === 255
						) {
							txt += ".";
						} else {
							throw new Error(`Invalid color rgba(${this.data[idx]},${this.data[idx + 1]},${this.data[idx + 2]},${this.data[idx + 3]}) found in ${file}`);
						}
					}
					txt += "\n"
				}
				console.log(`${txt}`);
				ans += txt + "\n";

				fs.writeFileSync(`${out_path}/${file.slice(0, -4)}.txt`, ans);
			});
	})
}