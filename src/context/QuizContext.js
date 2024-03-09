import { createContext, useContext, useEffect, useReducer } from "react";
import {
  apiGetQuestionsPlay,
  apiQuestionsSubmit,
} from "../services/apiQuestion";
import { useQuestionSubmit } from "../features/play/useQuestionSubmit";
import { useQuestionsPlay } from "../features/play/useQuestionsPlay";

const QuizContext = createContext();
const TIME_QUESTIONS = 30;
const initialState = {
  questions: [],
  status: "loading",
  index: 0,
  questionId: 0,
  answersId: [],
  listQuestionSubmitted: [],
  secondsRemaining: null,
  listQuestionChecked: [],
  totalScore: 0,
  highScore: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "dataReceived":
      return { ...state, questions: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * TIME_QUESTIONS,
      };
    case "newAnswer":
      const answersId = [...state.answersId];
      const answerIndex = answersId.indexOf(action.payload);
      const question = state.questions.at(state.index);
      if (answerIndex !== -1) {
        answersId.splice(answerIndex, 1);
      } else {
        answersId.push(action.payload);
      }
      return {
        ...state,
        questionId: question.id,
        answersId: answersId,
      };
    case "nextQuestion":
      const submittedQuestion = {
        id: state.questionId,
        answersSubmittedId: state.answersId,
      };
      return {
        ...state,
        index: state.index + 1,
        questionId: 0,
        answersId: [],
        listQuestionSubmitted: [
          ...state.listQuestionSubmitted,
          submittedQuestion,
        ],
      };
    case "finish":
      return {
        ...state,
        listQuestionChecked: action.payload?.listQuestionChecked,
        totalScore: action.payload?.totalScore,
        highScore:
          action.payload?.totalScore > state.highScore
            ? action.payload?.totalScore
            : state.highScore,
        status: "finished",
      };
    case "restart":
      return {
        ...initialState,
        highScore: state.highScore,
        status: "loading",
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      break;
  }
};

const QuizProvider = ({ children }) => {
  const [
    {
      status,
      index,
      questions,
      answersId,
      listQuestionSubmitted,
      secondsRemaining,
      listQuestionChecked,
      totalScore,
      highScore,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;

  const { isLoading, createPlay, data } = useQuestionsPlay();

  useEffect(() => {
    if (!isLoading && data) {
      if (data.statusCode === 400) {
        dispatch({ type: "dataFailed" });
      } else {
        dispatch({ type: "dataReceived", payload: data });
      }
    }
  }, [isLoading, data]);

  const {
    isLoading: isLoadingSubmit,
    submitQuestion,
    data: dataSubmit,
  } = useQuestionSubmit();

  useEffect(() => {
    if (!isLoadingSubmit && dataSubmit) {
      if (dataSubmit.statusCode === 400) {
        dispatch({ type: "dataFailed" });
      } else {
        dispatch({ type: "finish", payload: dataSubmit?.data });
      }
    }
  }, [isLoadingSubmit, dataSubmit]);

  const value = {
    status,
    index,
    questions,
    answersId,
    listQuestionSubmitted,
    secondsRemaining,
    listQuestionChecked,
    totalScore,
    highScore,

    numQuestions,
    dispatch,
    createPlay,
    submitQuestion,
    isLoadingSubmit,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined)
    throw new Error("Quiz context use outside QuizProvider");
  return context;
};

export { QuizProvider, useQuiz };