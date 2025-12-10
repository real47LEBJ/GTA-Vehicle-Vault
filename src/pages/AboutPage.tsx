import React from 'react';
import styles from '../styles/pages/AboutPage.module.css';



interface AboutPageProps {
  className?: string;
}

const AboutPage: React.FC<AboutPageProps> = ({ className }) => {
  // 提取内容为一个变量，方便复用
  const functionList = (
    <>
      <h1>功能</h1>
      <h3>载具管理</h3>
      <ul>
        <li>创建自定义车库 ：支持设置车库名称、容量和备注信息</li>
        <li>车库编辑与删除 ：支持修改车库备注信息和删除车库</li>
        <li>载具移动与删除 ：支持移动载具到任意车库的任意车位，支持删除载具&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
      </ul>

      <h3>载具添加</h3>
      <ul>
        <li>几乎包含所有游戏内的载具</li>
        <li>按照品牌分类浏览载具</li>
        <li>多维度筛选 ：
          <ul>
            <li>载具类型筛选（如跑车、SUV、摩托车等）</li>
            <li>载具特性筛选（如本尼改装、阿浩改装等）</li>
            <li>价格排序（升序/降序）</li>
            <li>显示/隐藏不可获取的载具</li>
            <li>支持中英文名称模糊搜索</li>
          </ul>
        </li>
      </ul>
    </>
  );
  const helpList = (
    <>
      <h1>部署</h1>
      <h3>软件部署</h3>
      <ul>
        <li>下载exe文件后直接运行</li>
      </ul>

      <h3>数据部署</h3>
      <ul>
        <li>首次运行软件，会在以下目录自动创建两个.db数据库</li>
        <li>(C:\Users\UserName\AppData\Roaming\gtaoldb)</li>
        <li>关闭软件，下载最新的gtavm_common.db覆盖后打开软件&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
        <li>gtavm_user.db无需操作</li>
      </ul>
    </>
  );
  const updateList = (
    <>
      <h1>更新</h1>
      <h3>软件更新</h3>
      <ul>
        <li>下载最新exe文件即可</li>
      </ul>

      <h3>数据更新</h3>
      <ul>
        <li>下载最新的gtavm_common.db文件覆盖即可</li>
        <li>(gtavm_user.db保存了用户数据，请定期备份)</li>
        <li>在载具管理页面点击更新数据按钮以同步载具特性</li>
      </ul>
    </>
  );
  return (
    <div className={`${className} ${styles.container}`}>
      {/* 左侧内容 */}
      <div className={styles.functionListSection}>
        {helpList}
      </div>
      {/* 左侧内容 */}
      <div className={styles.functionListSection}>
        {functionList}
      </div>
      {/* 右侧内容 */}
      <div className={styles.functionListSection}>
        {updateList}
      </div>
    </div>
  )
};

export default AboutPage;