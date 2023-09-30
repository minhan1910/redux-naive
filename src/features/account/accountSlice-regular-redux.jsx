
/* eslint-disable no-unused-vars */
const initialStateAccount = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

export default function accountReducer(state = initialStateAccount, action) {
  switch (action.type) {    
    case "account/deposit": {
      return {
        ...state,
        balance: state.balance + action.payload,
        isLoading: false,
      };
    }

    case "account/withdraw": {
      const balanceAfterWithdrawing = state.balance - action.payload;

      if (balanceAfterWithdrawing < 0) {
        return state;
      }

      return {
        ...state,
        balance: balanceAfterWithdrawing,
      };
    }

    case "account/requestLoan": {
      if (state.loan > 0) {
        return state;
      }

      return {
        ...state,
        loan: action.payload.amount,
        loanPurpose: action.payload.purpose,
        balance: state.balance + action.payload.amount,
      };
    }

    case "account/payLoan": {
      if (!state.loanPurpose || !state.loan) {
        return state;
      }

      const balanceAfterPayingLoan = state.balance - state.loan;

      return {
        ...state,
        loan: 0,
        loanPurpose: "",
        balance: balanceAfterPayingLoan,
      };
    }

    case "account/convertingCurrency": {
      return {
        ...state,
        isLoading: true,
      };
    }

    default:
      return state;
  }
}

export function deposit(amount, currency) {
  if (currency === "USD") {
    return { type: "account/deposit", payload: amount };
  }

  // auto know the async action
  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });

    // API Call
    const host = "api.frankfurter.app";
    const res = await fetch(
      `https://${host}/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    const converted = data.rates.USD;

    // return action
    dispatch({ type: "account/deposit", payload: converted });
  };
}

export function withdraw(amount) {
  return { type: "account/withdraw", payload: amount };
}

export function requestLoan(amount, purpose) {
  return { type: "account/requestLoan", payload: { amount, purpose } };
}

export function payLoan() {
  return { type: "account/payLoan" };
}
