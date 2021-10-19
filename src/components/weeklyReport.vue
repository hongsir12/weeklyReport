<template>
  <div class="com-container">
    <vue-xlsx-table @on-select-file="handleSelectedFile"
      >上传excel</vue-xlsx-table
    >
    <div class="com-chart" ref="reportRef"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      data: null,
      //ds: null,
    }
  },

  mounted() {
    //this.initChart()
  },

  methods: {
    // 初始化对象
    initChart() {
      let data = this.data
      // 计算 工作时长
      for (let rec of data) {
        // console.log(rec['日期']+rec['姓名']+rec['工作内容']);
        rec['开始时间'] = rec['日期'] + ' ' + rec['开始时间']
        rec['结束时间'] = rec['日期'] + ' ' + rec['结束时间']
        rec['工作时长'] = Math.floor(
          (new Date(rec['结束时间']).getTime() -
            new Date(rec['开始时间']).getTime()) /
            1000 /
            60
        )
        if (rec['工作时长'] < 0) {
          //   console.log(rec['工作时长'])
          let date = new Date(rec['日期']).format('yyyy-MM-dd')
          date = new Date(date)
          date = date.setDate(date.getDate() + 1)
          date = new Date(date).format('yyyy-MM-dd')
          // console.log(date);
          rec['结束时间'] = rec['结束时间'].slice(10)
          rec['结束时间'] = date + rec['结束时间']
          rec['工作时长'] = Math.floor(
            (new Date(rec['结束时间']).getTime() -
              new Date(rec['开始时间']).getTime()) /
              1000 /
              60
          )
        }
        // console.log(rec['姓名']+rec['工作时长']);
      }
      //   console.log(data);

      // 计算 X轴 Y轴
      let nameMap = []
      let xAx = []
      for (let rec of data) {
        if (-1 === nameMap.indexOf(rec['姓名'])) {
          let tmp = nameMap.length * 5
          for (let i = 1; i <= 5; i++) {
            xAx.push(i + tmp)
          }
          nameMap.push(rec['姓名'])
        }
      }
      xAx.push(xAx.length + 1)
      function calcX(sDate, sName) {
        let idx = nameMap.indexOf(sName) * 5
        return new Date(sDate).getDay() + idx
      }

      let hashMap = {}
      function calcY(rec) {
        let day = new Date(rec['开始时间']).getDay()
        hashMap[rec['姓名']] = hashMap[rec['姓名']] || {}
        hashMap[rec['姓名']][`${day}`] = hashMap[rec['姓名']][`${day}`] || {}
        let tmp = rec['工作时长']
        let i = 10
        while (
          undefined !== hashMap[rec['姓名']][`${day}`][`${tmp}`] &&
          i-- > 0
        ) {
          tmp += 4
        }
        hashMap[rec['姓名']][`${day}`][`${tmp}`] = true
        return tmp
      }

      for (let rec of data) {
        rec.x = calcX(
          new Date(rec['开始时间']).format('yyyy-MM-dd'),
          rec['姓名']
        )
        rec.y = calcY(rec)
      }

      // 生成数据源和图表配置
      let ds = [
        {
          dimensions: ['姓名', 'x', 'y', '工作时长', '开始日期'],
          source: data,
        },
      ]
      let ss = []
      let oldT = 0
      let symbol = ['circle', 'rect', 'triangle', 'diamond', 'roundRect', 'pin']
      let times = [30, 90, 120, 240, 480]
      for (let i = 0; i < times.length; i++) {
        let t = times[i]
        if (i === times.length - 1) {
          ds.push({
            transform: {
              type: 'filter',
              config: { dimension: '工作时长', '>=': oldT },
            },
          })
        } else {
          ds.push({
            transform: {
              type: 'filter',
              config: { dimension: '工作时长', '>=': oldT, '<=': t },
            },
          })
          oldT = t + 1
        }

        ss.push({
          name: `${t}分钟`,
          datasetIndex: ss.length + 1,
          type: 'scatter',
          symbol: symbol[i],
          encode: {
            x: 'x',
            y: 'y',
          },
        })
        
      }

      // 统计周总工作量并生成 源 和 图
      let sumData = []
      for (let rec of data) {
        let idx = sumData.findIndex(e => e['姓名'] === rec['姓名'])
        if (-1 === idx) {
          sumData.push({
            姓名: rec['姓名'],
            总工时: rec['工作时长'],
            x: nameMap.indexOf(rec['姓名']) * 5 + 5,
            y: rec['工作时长'],
          })
        } else {
          sumData[idx]['总工时'] += rec['工作时长']
          sumData[idx].y = sumData[idx]['总工时']
        }
      }
      for (let rec of sumData) {
        rec['总工时'] = Math.floor(rec['总工时'] / 60)
        rec.y = rec['总工时']
        if (rec.y > 50) {
          rec.y = 50
        }
      }
      // console.log(sumData);
      ds.push({
        dimensions: ['姓名', 'x', 'y', '总时长'],
        source: sumData,
      })
      ss.push({
        name: '总工时',
        type: 'line',
        yAxisIndex: 1,
        datasetIndex: ss.length + 1,
        encode: {
          x: 'x',
          y: 'y',
        },
      })

      const option = {
        title: {
          text: '人员工作量分布图',
          left: '1%',
        },
        legend: {},
        tooltip: {
          formatter: param => {
            // console.log(this);
            // return param.seriesName + ' <br/>'
            //     + param.value["存储"] + ' <br/>'
            //     + param.value["日期"] + ' <br/>';
            if (undefined === param.value['总工时']) {
              return `工作时长: ${param.value['工作时长']}分钟 <br/>姓名: ${param.value['姓名']} <br/>开始时间: ${param.value['开始时间']}`
            } else {
              return `总工时: ${param.value['总工时']}小时 <br/>姓名: ${param.value['姓名']}`
            }
          },
        },
        dataset: ds,
        yAxis: [
          {
            type: 'value',
            name: '工作时长(m/天)',
            max: 720,
            interval: 50,
            axisTick: {
              alignWithLabel: true,
            },
          },
          {
            type: 'value',
            name: '总时长(h/周)',
            max: 50,
            interval: 10,
            position: 'right',
            splitLine: {
              show: false,
            },
          },
        ],
        xAxis: {
          type: 'value',
          interval: 1,
          position: 'bottom',
          data: xAx,
          axisTick: {
            //alignWithLabel: true,
          },
          axisLabel: {
            formatter: param => {
              let offset = 0
              const map = {
                '1': '1',
                '2': '2',
                '3': '3',
                '4': '4',
                '5': '5',
              }
              if (0 !== (param + offset) % 5) {
                return '' //`周${map[param % 5]}`
              } else {
                return nameMap[Math.floor((param + offset) / 5) - 1]
              }
            },
          },
        },
        series: ss,
      }
      this.chartInstance = this.$echarts.init(this.$refs.reportRef)
      this.chartInstance.setOption(option)
    },
    handleSelectedFile(convertedData) {
      //   console.log(convertedData)
      this.data = convertedData.body
      this.initChart()
    },
  },
}
</script>
<style lang="less" scoped></style>
