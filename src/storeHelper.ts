import * as path from "path";
import * as _ from "lodash";
import * as fs from 'fs';

const ProjectDir = process.cwd();
const projPath = (file: string) => path.join(ProjectDir, file);
const normalize = (files: string[]) =>
  files.filter(item => !item.includes("index.ts"));

export const genDts = (files: string[]) => {
  const importCode: string[] = [];
  const modules:string[] = [];

  files.forEach(item => {
    // 删除扩展名称
    const importpath = item.replace(/(.*)\.(ts|js)$/, "$1");
    const pathNormalize = item.replace(/(.*store\/)(.*?)\.ts$/, "$2");
    // 转换为数组
    let pathsegs = pathNormalize.split("/");

    // 转换类名
    const className = pathsegs.map(it => _.startCase(it)).join("");
    // 转换 namespace 为 snake_case
    const namespace = _.snakeCase(className);

    importCode.push(`import ${className} from '~/${importpath}'`);

    modules.push(`
    ${namespace} : {
      mutation: MutaionAction2Mutation<FunctionProperties<${className}>>;
      action: AsyncFunctionProperties<${className}>;
      getter: Pick<${className}, ReadonlyKeys<${className}>>;
      state: Omit<${className}, (keyof VuexModule) | FunctionPropertyNames<${className}> | ReadonlyKeys<${className}>>;
    };
    `);
  });

  return `/** this file is auto generator , please don't edit it*/
import {VuexModule} from 'vuex-module-decorators';
${importCode.join("\n")}

interface StoreHelper {
  ${modules.join("\n")}
}

declare module 'vue/types/vue' {
  interface Vue {
    $storeHelper: StoreHelper;
  }
}

declare module '@nuxt/vue-app/types/index' {
  interface Context {
    $storeHelper: StoreHelper;
  }
}
`;
};


export function getStoreFileList(searchPath: string): string[] {
  const filelist: string[] = [];
  const readdir = (dirpath: string, deep = 0) => {
    let list = fs.readdirSync(dirpath);
    list
      .filter(it => it.toLowerCase() !== "index.ts")
      .forEach(it => {
        let filepath = path.join(dirpath, it);
        if (fs.statSync(filepath).isDirectory()) {
          readdir(filepath, deep++);
        } else {
          filelist.push(filepath);
        }
      });
  };
  readdir(searchPath);
  return filelist;
}