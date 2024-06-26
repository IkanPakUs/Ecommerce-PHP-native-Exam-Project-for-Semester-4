<?php

class PaymentController
{
    public $code, $transaction;

    public function __construct()
    {
        $code = $_GET["code"];
        $transaction = DB::table('transactions')->select('transactions.*', 'transaction_statuses.name')->where('code', '=', $code)->leftJoin("transaction_statuses", "transaction_statuses.id", "=", "transactions.transaction_status_Id")->get()[0];

        if (!$transaction) {
            header('location: catalog.php');
        }

        $this->code = $code;
        $this->transaction = $transaction;
        $this->transaction["subtotal"] = $transaction["grand_total"] - ($transaction["tax"] - $transaction["shipping_fee"]);
    }

}