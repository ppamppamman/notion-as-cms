
---


layout: post


title:  "리액트에서 쓰던 것을 직접 만들며 느끼는 것들 - (1)"


author: ppamppamman


categories: [ Dev, Javascript, React, SPA ]


image: https://media.vlpt.us/images/ppamppamman/post/079c0a6b-9f6f-44e8-b12b-ca6b35c556f0/%E1%84%80%E1%85%B3%E1%84%85%E1%85%B5%E1%86%B71.png


image_desc: "SPA 만들기"


---


### ! CAUTION ! 글이 별로 재미가 없습니다 


자바스크립트만으로 SPA 만들기를 공부하면서 개인적인 목표로는 리액트에서 사용하던 방식을 컨셉으로나마 이해하는 것이었다.


## 라이프 사이클


리액트가 훅스기반의 함수형 컴포넌트로 개발 방향이 전환되면서 이전보다는 덜 신경 쓰게 되는 것이 개인적으로는 라이프 사이클이라고 생각한다. 클래스 기반의 리액트 개발을 할 때는 라이프사이클을 본격적으로 사용했느냐라고 물으면 그건 아니다. 클래스 기반의 리액트 프로젝트는 아직 직접 다뤄본 적이 없다. 다만 뷰로 개발을 할때보다 혹은 클래스 기반의 리액트 프로젝트 코드를 볼때보다는 확실히 덜 신경쓴다는 느낌이다.


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/121f6918-05ad-4e41-b7e7-9d330c07547d/d87eed2b-e7a7-4f52-9437-d931e7337e83/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240212%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240212T205716Z&X-Amz-Expires=3600&X-Amz-Signature=5ac2571dfcc49c0d60f1fe606e171f4088b7f390a0a426a0332e7c92d6fc865e&X-Amz-SignedHeaders=host&x-id=GetObject)


처음부터 리액트 라이프사이클의 모든 함수를 동일하게 만들어 사용하지는 않았고, 심지어 쓰지 않은 메소드들도 있다. 그럼에도 불구하고 이 주제로 글을 쓰는 이유는 글이나 누군가의 발표 영상으로나 접하던 브라우저의 렌더링 방식을 본격적으로 고민해볼 수 있었기 때문이다.


처음 컴포넌트를 만들때 사용한 구조는 대략적으로 이랬다.


```javascript
class Component {
	constructor({ $target, func }) {

		// 최상위 root컴포넌트로부터 내려받은 DOM객체
		this.$target = $target;
		
		// 관리되어야하는 상태를 담는 곳
		this.state = {};
		
		// 보통 다른 객체와의 상태나 외부 API 등에 종속성이 있는 경우,
		// 상위 컴포넌트에서 처리하기 위해 내려주는 함수
		this.func = func
		
		this.setState({});
	}

	setState({type, value}){
		// type과 value를 보고 상태를 업데이트 한다.
		
		this.render();
	}
	
	render() {
		// 여기서 돔 객체를 만든다.
	}
}
```


이 구조는 아주 편했다. 무엇보다 인스턴스를 새로 만들어주는 작업만으로 render()까지의 작업이 진행되도록 작성되어 만들어야하는 컴포넌트의 갯수가 많아질수록 개발하는 입장에서 편리하게 작용했다.


다만, 심적으로 걸렸던 부분은 업데이트할 state가 없음에도 setState()를 부르는 것이었다. 이번 아티클에서 다루는 구조 개선은 setState()를 반드시 필요한 부분에서 불러보자는 간단한 리팩토링 아이디어에서 시작되었다.


### 개선 1. constructor와 setState


리액트 공식 문서에 **blod처리된 글자**로 떡하니 써있는 말이 있다.


> constructor() 내부에서 setState()를 호출하면 안 됩니다 !


생성자 내에서 부수 효과를 발생시키거나 구독작업을 수행하면 안된다고 적혀있다. 그러한 작업들은 componentDidMount()나 다른 메서드에서 수행하라 나온다.


```javascript
constructor() { ... } // this.setState(); 제거
componentDidMount() {
	this.setState()
}
```


그러니까 이런 식이 되는 것이다.


기존에는 인스턴스를 만들 때 constructor를 실행하는 것으로 render()까지의 과정을 다뤘는데 그럼 componentDidMount()는 언제 실행해줘야 하는가에 대한 의문이 생겼다.


공식문서에는 트리에 삽입된 직후에 호출된다고 적혀있다. 


한 줄짜리 설명이지만, 브라우저 렌더링 방식에 있어 중요한 부분이다. 브라우저 렌더링 방식에 있어 렌더링 완료 상황으로부터 거꾸로 올라가면, 페인트 상황 이전의 렌더 트리를 만드는 상황, 그리고 그보다도 전인 DOM 트리를 만드는 상황에 불려야 한다는 말이 된다.


앞으로 공부하면서 지금의 판단은 달라질 여지는 있겠지만, 지금 상황에서 이걸 완벽하게 같은 로직으로 구현할 수 없었다.

	- 리서치한 자료들
	- [https://youshaohua.com/post/domcontentloaded_callback_and_componentdidmount_execute_order](https://youshaohua.com/post/domcontentloaded_callback_and_componentdidmount_execute_order)

프론트엔드 공부를 시작할 때부터 VirtualDOM 개념을 아주 많이 들어봤다. 속도가 아주 빠르고, 렌더링에 있어서 극한의 효율성을 자랑하고 뭐 이런 설명들. 문제는 이 안쓰이던 상황에서 VDOM이 쓰이는 상황으로 전환된 후 얻게된 효과들을 느끼기는 어려웠다는 점이다.


개인적으로 이 componentDidMount()를 DOMContentLoaded나 onload()로 다뤄보려고 애를 썼는데, 해당 이벤트들의 발생 환경이 태생적으로 차이가 있어서 성공하지 못했다. (당연한 일이다.) 아무런 제반 환경 없이 componentDidMount()를 구현하기가 어렵겠다는 생각에 VDOM으로 넘어오면서, 또 리액트라는 라이브러리를 프론트엔드 개발에 활용하게 되면서 개발자가 누리게 되는 편리함을 피부로 느낄 수 있었다.


정리하자면, JS SPA 프로젝트에서는 이런 식으로 불렀다.


```javascript
/* 부모컴포넌트.js */
const $component = new Component();
if ($component.render()) $component.componentDidMount();

// render()는 $target.appendChild($createdDom)을 return 한다.
// 노드가 $target에 붙었는지 안붙었는지를 기준으로 처리하는 원리이다.

```


리액트 문서에서는 componentDidMount()에서의 setState() 호출은 추가적인 렌더링이 발생한다고 적혀있다. 


여기서 파생되는 개선점이 있었다.


### 개선 2. componentDidMount와 componentDidUpdate


this.setState()를 통해 this.render()를 호출하는 것 까지는 간단하나 이 상황이 마운트 상황인지, 업데이트 상황인지는 알 수 없다. 그래서 그런가 hooks시대의 리액트는 useEffect함수로 마운트와 업데이트를 하나로 퉁쳐서 사용한다.


첫번째로 상태가 만들어지는 경우는 setState()를 활용하지 않는다. this.state를 직접할당할 수 있는 유일한 곳인 constructor()를 통해서 첫 상태를 만든다. 렌더링 시점으로 봐도 리렌더링 상황이 아니라 그냥 렌더링 상황이다. 이때문에 componentDidMount()는 인스턴스를 새로 만든 상황을 기준으로 단 한번만 작동하도록 부모 컴포넌트에서 직접 다뤄줬다.


이에 비해 componentDidUpdate()는 심플하다. 상태가 바뀌면 setState()로 상태를 바꿔줄 건데 그 아래에서 불러주면 될 것이다.


```javascript
setState() {
	...
	this.render()
	this.componentDidUpdate();
} 
```


만약 이런 상황이라면 컴포넌트는 아래의 흐름을 가져갈 것이다.


```javascript
componentDidMount() {
	this.setState()
}
```


new Component() ⇒ render() ⇒ componentDidMount() ⇒ setState() ⇒ render() & componentDidUpdate()


componentDidMount()에서 setState()가 즉시 불려지는 상황에 대해서는 리액트 공식문서에서도 따로 설명을 하고 있다. 두번의 렌더 과정에서 앞선 렌더 과정은 사용자가 보지는 못할테지만, 연산은 어쨌든 이뤄지기 때문에 퍼포먼스 문제를 주의하라고 적혀있다.


결과적으로 브라우저에 그려진 DOM에 종속된 상태를 업데이트 할 때 이러한 패턴이 활용된다는 것을 알 수 있었다.

