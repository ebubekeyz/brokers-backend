import { Request, Response } from "express";
import Deposit from "../models/depositModel";
import Investment from "../models/investmentModel";
import Withdrawal from "../models/withdrawalModel";

export const getAccountBalance = async (req: Request, res: Response) => {
  const userId = req.user._id; // Assuming authentication middleware sets this

  try {
    // Get all successful deposits
    const deposits = await Deposit.find({ user: userId, status: "approved" });
    const totalFunded = deposits.reduce((acc, curr) => acc + curr.amount, 0);

    // Get all investments
    const investments = await Investment.find({ user: userId });
    const totalInvested = investments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalProfit = investments.reduce((acc, curr) => acc + (curr.profit || 0), 0);

    // Get all approved withdrawals
    const withdrawals = await Withdrawal.find({ user: userId, status: "approved" });
    const totalWithdrawn = withdrawals.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate balance
    const balance = (totalFunded + totalProfit) - (totalInvested + totalWithdrawn);

    res.status(200).json({
      totalFunded,
      totalInvested,
      totalProfit,
      totalWithdrawn,
      balance,
    });

  } catch (error) {
    console.error("Balance error", error);
    res.status(500).json({ msg: "Server error while calculating balance" });
  }
};
